
import { GenericDBObject, TDBObjectView } from '../../db/genericdbobject';


interface IVoucher {
    id: number;
    parent?: number;
    code: string;
    created: Date;
    used?: Date;
}

export class GeneratedDBVoucher extends GenericDBObject implements IVoucher {
    
  constructor(
    public id: number,
    public parent: number | undefined,
    public code: string,
    public created: Date,
    public used: Date | undefined
    ){
      super();
  }

  static createFromDB(data: any){
      // @ts-ignore
      return new this(data.id, data.parent, data.code, data.created, data.used);
  }

  public JSONView(view: TDBObjectView) {
    if(view == null){
      return {
        id: this.id,
        parent: this.parent,
        code: this.code,
        created: this.created,
        used: this.used
      };
    }

    const result: any = {};
    if(view.includes('id')) { result.id = this.id; }
    if(view.includes('parent')) { result.parent = this.parent; }
    if(view.includes('code')) { result.code = this.code; }
    if(view.includes('created')) { result.created = this.created; }
    if(view.includes('used')) { result.used = this.used; }
    return result;  
  }

}
