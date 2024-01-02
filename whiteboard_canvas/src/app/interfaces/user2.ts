
  interface Choix{
    choix1:string | null;
    choix2:string | null;
  }

export interface User2 {
      pseudo?:string | null;
      email?:string | null;

      ecole:string | null;
      ville: string | null;
      niveau: string | null;
      choix: Choix;
      classe:string | null;
      birth?:string | null;
      status?:boolean | null;
}
