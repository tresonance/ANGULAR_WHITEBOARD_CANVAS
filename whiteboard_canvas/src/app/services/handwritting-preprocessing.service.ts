import { Injectable } from '@angular/core';
import { Subject , Observable, BehaviorSubject, of} from 'rxjs';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from 'angularfire2/database'
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
//import { ChatAdapter } from 'ng-chat';

import { AngularFireAuth } from 'angularfire2/auth';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';
import 'rxjs/add/operator/switchMap';
import { v4 as uuid } from 'uuid';

//import { v4 as uid } from 'uid';



import { Router } from '@angular/router';
import { NotifyService } from './notify.service';
import { AuthService} from './auth.service';
import { UserService} from './user.service';


//import {CanvasWhiteboardPoint, CanvasWhiteboardShapeOptions,CanvasStroke,
  //        CanvasWhiteboardUpdate, CanvasWhiteboardShape, CanvasWhiteboardUpdateType} from '../models/whiteboard/whiteboard'
  import { CanvasWhiteboardPoint, CanvasWhiteboardUpdateType, CanvasWhiteboardShapeOptions,CanvasStroke,
           CanvasWhiteboardUpdate, CanvasWhiteboardOptions , CircleShape, CanvasWhiteboardShape,
           RectangleShape, FreeHandShape, SmileyShape, LineShape, StarShape, INewCanvasWhiteboardShape} from '../models/whiteboard/whiteboard'

  export interface INewCanvasWhiteboardShape<T extends CanvasWhiteboardShape> {
              new(positionPoint?: CanvasWhiteboardPoint, options?: CanvasWhiteboardShapeOptions, ...args: any[]): T;
  }

import { StringFormat } from '../models/chat/string-format'

import * as firebase from 'firebase/app';

import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class HandwrittingPreprocessingService {

  BINARY_SEARCH_THRESHOLD: number = 2;

  DEHOOK_THRESHOLD:number = 90;
  DOT_REDUCTION_THRESHOLD:number = 2.0;
  SMOOTH_WEIGHTS: number[] = [1,1,1];
  DOUGLAS_PEUCKER_THRESHOLD:number = 2;

  constructor() { }

  /*****************************************************************************
  * Remove hooks from end of line of all lines in symbol
  * @param stroke which is a list of points;
  * @param  float $theta     Maximum angle that might occur at end of line
  *  @return new_stroke
  *****************************************************************************/

  dehook_singleStroke(stroke:CanvasStroke, $theta:number):CanvasStroke {

      let new_stroke:CanvasStroke = new CanvasStroke(null);

      let points:CanvasWhiteboardPoint[] = stroke.stroke;
      let len : number = points.length;

      //console.log("Before dehook: ", len);
      if(points.length < 3)
            new_stroke.stroke = [...points];
      else {
                // Get everything but the last point
                   new_stroke.stroke = points.slice(0, points.length - 1);
                // leave only the last 3 points
                   let lastThreePoints:CanvasWhiteboardPoint[] = points.slice(points.length - 3);
                //calculate angle
                  let $x1 = null;
                  let $y1 = null;
                  let $x2 = null;
                  let $y2 = null;
                  let $x3 = null;
                  let $y3 = null;
                lastThreePoints.forEach(($point:CanvasWhiteboardPoint) => {
                    if($x1 == null){

                      $x1 = $point['x'];
                      $y1 = $point['y'];

                    } else if($x2 == null){

                      $x2 = $point['x'];
                      $y2 = $point['y'];

                    } else if($x3 == null){

                      $x3 = $point['x'];
                      $y3 = $point['y'];

                    } else {

                      $x1 = $x2;
                      $x2 = $x3;
                      $x3 = $point['x'];
                      $y1 = $y2;
                      $y2 = $y3;
                      $y3 = $point['y'];
                    }

                    if($x3 != null){

                        let $v1:{x:number, y:number} = {x:$x2 - $x1, y:$y2 - $y1};
                        let $v2:{x:number, y:number} = {x:$x3 - $x2, y:$y3 - $y2};

                        // calculate angle with dot product
                        let $angle = Math.acos(($v1['x']*$v2['x']+$v1['y']*$v2['y'])/
                          (Math.sqrt(Math.pow($v1['x'], 2) + Math.pow($v1['y'], 2))
                          * Math.sqrt(Math.pow($v2['x'], 2) + Math.pow($v2['y'], 2)))) * 180.0 / Math.PI;

                          if ($angle < $theta) {
                              new_stroke.stroke.push($point);
                          } else {
                            // This was a hook! Remove that point and test again!
                            new_stroke = this.dehook_singleStroke(new_stroke, $theta);
                          }
                    }

                })
          }

      //  console.log("After dehook: ", new_stroke.stroke.length);
      return new_stroke;
  }

  dehook_stroke(strokeArray:CanvasStroke[], $theta:number, context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions):CanvasStroke[]{
      for(let i=0; i < strokeArray.length; i++){
          strokeArray[i] = this.dehook_singleStroke(strokeArray[i], this.DEHOOK_THRESHOLD);
          //this.draw_dot(strokeArray[i], context, options);
          //this.draw(strokeArray[i], context, options);
          //this.draw_stroke_border(strokeArray[i], context, options);
      }
      return strokeArray;
  }


  /*****************************************************************************
  * Sampling
  * @param stroke which is a list of points;
  * @param  float $theta     $theta     Minimum time delay
  *  @return new_stroke
  *****************************************************************************/

  sampling_singleStroke(stroke:CanvasStroke):CanvasStroke {

      let new_stroke:CanvasStroke = new CanvasStroke();

      let points:CanvasWhiteboardPoint[] = stroke.stroke;
      let len = points.length;

      if(len <= 1){
        //console.log("il ya un seul point");
        return stroke;
      }
    //  console.log("Before Sampling: ", len);
      const {total, dist_array } = this.total_distance(stroke);
      let step = total / (len - 1);

      new_stroke.stroke = [];

      for(let i=1; i< len - 2; i++){
           let d:number = i * step;
           let index = this.binarySerach(dist_array, d);
           let start = Math.floor(index);
           let end = start + 1;
           let  fraction = index - start;
           let  x:number = (points[end].x - points[start].x) * fraction + points[start].x;
           let  y :number= (points[end].y - points[start].y) * fraction + points[start].y;
           let  t:number = (points[end].t - points[start].t) * fraction + points[start].t;

           new_stroke.stroke.push(new CanvasWhiteboardPoint(x, y, t));

      }
  //    console.log("After Sampling: ", new_stroke.stroke.length);
      return new_stroke;

  }

  sampling(strokeArray:CanvasStroke[], context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions):CanvasStroke[]{
      for(let i=0; i < strokeArray.length; i++){
          strokeArray[i] = this.sampling_singleStroke(strokeArray[i]);
          //this.draw_dot(strokeArray[i], context, options);
          //this.draw(strokeArray[i], context, options);
          //this.draw_stroke_border(strokeArray[i], context, options);
      }
      return strokeArray;
  }

  /*****************************************************************************
  * dot Reduction
  * @param stroke which is a list of points;
  * @param  float $theta     $theta    minimum distance
  *  @return new_stroke
  *****************************************************************************/

  dot_reduction_simple_stroke(stroke:CanvasStroke, $theta:number):CanvasStroke {
        let new_stroke:CanvasStroke = new CanvasStroke();
        let points:CanvasWhiteboardPoint[] = stroke.stroke;
        let len : number = points.length;

        new_stroke.stroke = [];
      //  console.log("before dot reduction: ", len)
        if(this.get_max_distance(stroke) < $theta){

            new_stroke.stroke.push(this.get_average_point(stroke));
        } else
            new_stroke.stroke = stroke.stroke;
        //  console.log("After  dot reduction: ", new_stroke.stroke.length);
        return new_stroke;
  }

  dot_reduction(strokeArray:CanvasStroke[], $theta:number, context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions):CanvasStroke[] {

    for(let i=0; i < strokeArray.length; i++){
          strokeArray[i] = this.dot_reduction_simple_stroke(strokeArray[i], $theta);
          //this.draw_dot(strokeArray[i], context, options);
          //this.draw(strokeArray[i], context, options);
          //this.draw_stroke_border(strokeArray[i], context, options);

      }
    return strokeArray;
  }

  /*****************************************************************************
  * Smoothing
  * @param stroke which is a list of points;
  * @param  float $theta     $theta    minimum distance
  *  @return new_stroke
  *****************************************************************************/

  smooth_singleStroke(stroke:CanvasStroke, $weights:number[]):CanvasStroke {
      const arrSum = arr => arr.reduce((a,b) => a + b, 0);
      let points:CanvasWhiteboardPoint[] = stroke.stroke;

      if(points.length <= 1)
          return stroke;
      let summ = arrSum($weights);
      let len = points.length;
      let new_stroke = new CanvasStroke([]);

      //console.log("Before smooth: ", len);
      for(let i = 0; i<$weights.length; i++){
        $weights[i] /= summ;
      }

      new_stroke.stroke = [];
      for(let j=1;j< len - 1; j++){
         let point = new CanvasWhiteboardPoint(
              $weights[0]*points[j-1]['x']
                          + $weights[1]*points[j]['x']
                          + $weights[2]*points[j+1]['x'],
              $weights[0]*points[j-1]['y']
                          + $weights[1]*points[j]['y']
                          + $weights[2]*points[j+1]['y'],
              $weights[0]*points[j-1]['t']
                          + $weights[1]*points[j]['t']
                          + $weights[2]*points[j+1]['t'],
         )
         new_stroke.stroke.push(point);
      }
      new_stroke.stroke.push(points[len - 1]);
    //  console.log("After smooth: ", new_stroke.stroke.length);
      return new_stroke;
  }

  smooth(strokeArray:CanvasStroke[], $weights:number[], context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions):CanvasStroke[] {
    for(let i=0; i < strokeArray.length; i++){
        strokeArray[i] = this.smooth_singleStroke(strokeArray[i], $weights);
        //this.draw(strokeArray[i], context, options);
        //this.draw_stroke_border(strokeArray[i], context, options);
    }
    return strokeArray;
  }

  /*****************************************************************************
  * SCALE and shift
  * Scale a list of points so that they fit into a unit square and shift the
  * points into [0, 1] x [0, 1].
  * @param stroke which is a list of points;
  * @param  boolean $center    Should the symbol be centered within [0,1]x[0,1]
  *  @return new_stroke
  *****************************************************************************/
  scale_and_shift_single_stroke(stroke:CanvasStroke):CanvasStroke {

        let new_stroke:CanvasStroke = new CanvasStroke();

        let points:CanvasWhiteboardPoint[] = stroke.stroke;
        let len = points.length;
        const {min_x, min_y, max_x, max_y, min_t, max_t} = this.set_border_points(stroke);


        let $factorX = 1;
        let $factorY = 1;

        new_stroke.stroke = [];

        let width = max_x - min_x + 1;
        let height = max_y - min_y + 1;

        //Calculate parameters for scaling and shifting to [−0.5, 0.5] × [−0.5, 0.5]

          $factorX = 1.0/width;
          $factorY = 1.0/height;

        let $factor = Math.min($factorX, $factorY)
        let $addx = width * $factorX * 0.5 ;  //it means we divide by 2
        let $addy = height * $factorY * 0.5 ;

      //  Move every single point of a recording
       for(let i = 0; i < len; i++){
          new_stroke.stroke.push( new CanvasWhiteboardPoint(
                (points[i]["x"] - min_x)*$factor - $addx,
                -(points[i]["y"] - min_y)*$factor + $addy,
                (points[i]["t"] - min_t)
          ))
       }
       console.log("scale and shift OK!");
       return new_stroke;
  }

  scale_and_shift(strokeArray:CanvasStroke[], context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions):CanvasStroke[] {

    for(let i=0; i < strokeArray.length; i++){
        strokeArray[i] = this.scale_and_shift_single_stroke(strokeArray[i]);
        this.draw(strokeArray[i], context, options);
        this.draw_stroke_border(strokeArray[i], context, options);
    }
    return strokeArray;
  }

  /*****************************************************************************
  * DOUGLAS PEUCKER
  * @param stroke which is a list of points;
  * @param epsilon
  *  @return new_stroke
  *****************************************************************************/
  douglas_peucker_singleStroke(stroke:CanvasStroke, $epsilon:number):CanvasStroke {
      let dmax = 0;
      let $index = 0;
      let points:CanvasWhiteboardPoint[] = stroke.stroke;

      let len : number = points.length;

    //  console.log("Before Douglas Peucker: ", len);
      for(let i=1; i<len; i++){
          let d = this.distance_from_point_to_line(points[0], points[len -1], points[i]);

          if(d > dmax){
            dmax = d;
            $index = i;
          }
      }

      let $results1:CanvasStroke = new CanvasStroke();
          $results1.stroke = [];

      let $results2:CanvasStroke = new CanvasStroke();
          $results2.stroke = [];

      let $results:CanvasStroke = new CanvasStroke();
          $results.stroke = [];

      if(dmax > $epsilon){
            $results1.stroke = points.slice( 0, $index)
            $results1 = this.douglas_peucker_singleStroke( $results1, $epsilon);

            $results2.stroke = points.slice($index, -1);
            $results2 = this.douglas_peucker_singleStroke( $results2, $epsilon);

            $results.stroke = $results1.stroke.concat($results2.stroke);
      } else {
          $results.stroke = points;
      }
      stroke = $results;
    //  console.log("After Douglas Peucker: ", stroke.stroke.length);
      return $results;
  }

  douglas_peucker(strokeArray:CanvasStroke[], epsilon:number, context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions):CanvasStroke[] {

    for(let i=0; i < strokeArray.length; i++){
        strokeArray[i] = this.douglas_peucker_singleStroke(strokeArray[i], epsilon);
        //this.draw_dot(strokeArray[i], context, options);
        //this.draw(strokeArray[i], context, options);
        //this.draw_stroke_border(strokeArray[i], context, options);
    }
    return strokeArray;
  }




  //------------------------------------------------------------------
  //    PRE-PROCESSING - RESUME
  //------------------------------------------------------------------
    preporocessing(strokeArray:CanvasStroke[], context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions, translation?:CanvasWhiteboardPoint): CanvasStroke[] {


        //Noise Reduction : Dot reduction, Dehooking, Filtering
            strokeArray = this.dehook_stroke(strokeArray, this.DEHOOK_THRESHOLD, context, options);
            strokeArray = this.dot_reduction(strokeArray, this.DOT_REDUCTION_THRESHOLD, context, options);
            strokeArray = this.douglas_peucker(strokeArray, this.DOUGLAS_PEUCKER_THRESHOLD, context, options);
            strokeArray = this.smooth(strokeArray, this.SMOOTH_WEIGHTS, context, options);
            strokeArray = this.sampling(strokeArray, context, options);
            //strokeArray = this.scale_and_shift(strokeArray, context, options);


        return strokeArray;
    }

  //----------------------------------------------------------------------------------------------------------------------/
  //  UTILS  UTILS
  //----------------------------------------------------------------------------------------------------------------------/
  distance(A:CanvasWhiteboardPoint, B:CanvasWhiteboardPoint){
    let dx:number = (B.x - A.x);
    let dy:number = (B.y - B.y);

    return Math.sqrt(dx*dx + dy*dy);
  }

  distance_squarre(A:CanvasWhiteboardPoint, B:CanvasWhiteboardPoint){
    let dx:number = (B.x - A.x);
    let dy:number = (B.y - B.y);

    return (dx*dx + dy*dy);
  }

  total_distance(stroke:CanvasStroke): {total:number, dist_array:number[] } {

      let dist:number = 0;
      let arr:number[] = [];

      let points:CanvasWhiteboardPoint[] = stroke.stroke;
      let len : number = points.length;

      arr.push(0);

      for(let i=1; i<len;i++){
         dist += this.distance(points[i - 1], points[i]);
         arr.push(dist);
      }
      return {total:dist, dist_array:arr};
  }

  binarySerach(dist_array:number[], distance:number){
      let len:number = dist_array.length;

      let lower:number = 0;
      let upper:number = len - 1;
      let middle = Math.floor((lower + upper) / 2);

      while(lower <= upper){

        if(dist_array[middle] < distance){
            lower = middle + 1;
        } else if(distance == dist_array[middle]){
            return middle;
        } else if (dist_array[middle] > distance){
           upper = middle - 1;
        }
            middle = Math.floor((lower + upper) / 2);

      }
      if(Math.abs(dist_array[middle + 1] - dist_array[middle]) <= this.BINARY_SEARCH_THRESHOLD)
            return middle;
      return (distance - dist_array[middle]) / (dist_array[middle + 1] - dist_array[middle]) + middle;
  }

  get_average_point(stroke:CanvasStroke):CanvasWhiteboardPoint {

    let mean_x :number = 0;
    let mean_y :number = 0;
    let mean_t :number = 0;
    let points:CanvasWhiteboardPoint[] = stroke.stroke;

    let len : number = points.length;
    for(let i = 0; i < len; i++){
        mean_x += points[i].x;
        mean_y += points[i].y;
        mean_t += points[i].t;
    }
    mean_x /= len;
    mean_y /= len;
    mean_t /= len;

    return new CanvasWhiteboardPoint(mean_x, mean_y, mean_t);
  }

  get_max_distance(stroke:CanvasStroke): number {
      let points:CanvasWhiteboardPoint[] = stroke.stroke;
      let len:number = points.length;

      if(points.length <= 1){
        return -1;
      }

      let max_dist = this.distance_squarre(points[0], points[1])
      for(let i = 0; i < len - 1 ; i++){
          for(let j = i + 1; j< len; j++){
             max_dist = Math.max(this.distance_squarre(points[i], points[j]), max_dist);
          }
      }
      return Math.sqrt(max_dist);
  }

  distance_from_point_to_line(p1:CanvasWhiteboardPoint, p2:CanvasWhiteboardPoint, p3:CanvasWhiteboardPoint):number{
      //distance from p3 to line p1 p2
      let dx12 = p2.x - p1.x;
      let dy12 = p2.y - p1.y;

      let dist12 = dx12*dx12 + dy12*dy12;
      if(dist12 == 0){
        return 0;
      }
      let dx13 = p3.x - p1.x;
      let dy13 = p3.y - p1.y;

      let $u = (dx13*dx12 + dy13*dy12) / dist12;

      if ($u > 1) {
        $u = 1;
      } else if ($u < 0) {
        $u = 0;
      }

      let $x = p1['x'] + $u * dx12;
      let $y = p1['y'] + $u * dy12;
      let $dx = $x - p3['x'];
      let $dy = $y - p3['y'];

      let $dist = Math.sqrt($dx*$dx + $dy*$dy);
      return $dist;
  }

  set_border_points(stroke:CanvasStroke):{min_x:number, min_y:number, max_x:number, max_y:number, min_t:number, max_t:number}{
      if(!stroke || !stroke.stroke){
        console.log("Empty stroke instance");
        return;
      }

      let points:CanvasWhiteboardPoint[] = stroke.stroke;
      let len : number = points.length;

      let min_x:number  = points[0].x;
      let min_y:number  = points[0].y;

      let max_x:number  = points[0].x;
      let max_y:number  = points[0].y;

      let min_t:number  = points[0].t;
      let max_t:number  = points[len - 1].t;

      for(let i=0; i< len;i++){
          //min
          if(points[i].x < min_x){
            min_x = points[i].x;
          }

          if(points[i].y < min_y){
            min_y = points[i].y
          }
          //max
          if(points[i].x > max_x){
              max_x = points[i].x;
          }

          if(points[i].y > max_y){
            max_y = points[i].y;
          }

      }
      return {min_x:min_x, min_y:min_y, max_x:max_x, max_y:max_y, min_t:min_t, max_t:max_t};

  }

  /*****************************************************************************/
  /*  drawing functions
  /*****************************************************************************/

      draw_stroke_border(stroke:CanvasStroke, context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions){

            const {min_x, min_y, max_x, max_y, min_t, max_t} = this.set_border_points(stroke);

            context.beginPath();

            Object.assign(context, options);

            context.strokeStyle = 'rgba(240,0,0,0.5)';
            context.rect(min_x, min_y, max_x - min_x + 1, max_y - min_y + 1);

            context.stroke();
            if (options.shouldFillShape) {
                    context.fill();
            }
            context.closePath();
      }

      draw_dot(stroke:CanvasStroke, context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions):void {

            let CopyLineWidth = options.lineWidth;
            let copyStrokeStyle = options.strokeStyle;

            options.strokeStyle = 'rgba(0, 255, 0)';
            options.lineWidth = 2;

            context.beginPath();

            Object.assign(context, options);

                let points = stroke.stroke;
                let len : number = points.length;

                for(let j=0; j<len ; j++){

                      context.strokeRect(points[j].x, points[j].y, 1, 1);
                }

           context.stroke();
           if (options.shouldFillShape) {
               context.fill();
           }
           context.closePath();

           //restutier les anciennes couleurs
          options.lineWidth = CopyLineWidth;
          options.strokeStyle = copyStrokeStyle;
      }

      draw(stroke:CanvasStroke, context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions):void {

          if(stroke.stroke.length < 1)
              return ;

          Object.assign(context, options);

          let copy_style  = context.strokeStyle
          let points:CanvasWhiteboardPoint[] = stroke.stroke;
          let len : number = points.length;

            if(len == 1){
                context.rect(points[0].x, points[0].y,  1, 1);
            } else {

                context.beginPath();
                context.moveTo(points[0].x, points[0].y);
                // Draw a dot
                context.lineTo(points[1].x, points[1].y);

                // Quadratic curves drawing
                let i = 2;
                while (i < len) {
                  if (len - i > 2) {
                  let controlPoint1 = points[i];
                  let controlPoint2 = points[i + 1];
                  let endPoint = points[i + 2];
                  context.bezierCurveTo(controlPoint1.x,
                      controlPoint1.y,
                      controlPoint2.x,
                      controlPoint2.y,
                      endPoint.x,
                      endPoint.y);
                  i += 2;
              } else {
                  let linePosition = points[i];
                  context.lineTo(linePosition.x, linePosition.y);
                  i += 1;
              }
          }
        }

          context.strokeStyle = 'rgba(40, 150, 60)';
          context.stroke();
          context.strokeStyle = copy_style;
      }

      copy(min_x:number, min_y:number, max_x:number, max_y:number, context:CanvasRenderingContext2D, options:CanvasWhiteboardShapeOptions):void {
        var imgData = context.getImageData(min_x, min_y, max_x - min_x + 1, max_y - min_y + 1);
        context.putImageData(imgData, 60, 70);
      }



//-----------------------END ------------------------/

}
