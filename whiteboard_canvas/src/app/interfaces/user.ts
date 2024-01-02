
export interface User {
    pseudo?:string | null;
    birth?:string | null;
}

export interface UserMoreInfo {
  uid:string | null;
  birth:string | null;
  classe:string | null;
  email:string | null;
  pseudo:string | null;
  avatar?:string | null;
  status?:string | null;
  checked?:boolean | false;
  isIn_socket_room?:boolean | false; //SEE CAMERA COMPONENT
}
