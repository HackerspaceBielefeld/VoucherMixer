
import { GenericDBObject, TDBObjectView } from '../../db/genericdbobject';


interface ICandidate {
    id: number;
    mail: string;
    distributionround: number;
    completed: boolean;
}

export class GeneratedDBCandidate extends GenericDBObject implements ICandidate {
    
  constructor(
    public id: number,
    public mail: string,
    public distributionround: number,
    public completed: boolean
    ){
      super();
  }

  static createFromDB(data: any){
      // @ts-ignore
      return new this(data.id, data.mail, data.distributionround, data.completed == 1);
  }

  public JSONView(view: TDBObjectView) {
    if(view == null){
      return {
        id: this.id,
        mail: this.mail,
        distributionround: this.distributionround,
        completed: this.completed
      };
    }

    const result: any = {};
    if(view.includes('id')) { result.id = this.id; }
    if(view.includes('mail')) { result.mail = this.mail; }
    if(view.includes('distributionround')) { result.distributionround = this.distributionround; }
    if(view.includes('completed')) { result.completed = this.completed; }
    return result;  
  }

}
