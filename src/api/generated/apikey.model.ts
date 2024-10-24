
import { GenericDBObject, TDBObjectView } from '../../db/genericdbobject';


interface IApiKey {
    id: number;
    keyvalue: string;
    description?: string;
    validfrom: Date;
    validto: Date;
    usecase?: string;
}

export class GeneratedDBApiKey extends GenericDBObject implements IApiKey {
    
  constructor(
    public id: number,
    public keyvalue: string,
    public description: string | undefined,
    public validfrom: Date,
    public validto: Date,
    public usecase: string | undefined
    ){
      super();
  }

  static createFromDB(data: any){
      // @ts-ignore
      return new this(data.id, data.keyvalue, data.description, data.validfrom, data.validto, data.usecase);
  }

  public JSONView(view: TDBObjectView) {
    if(view == null){
      return {
        id: this.id,
        keyvalue: this.keyvalue,
        description: this.description,
        validfrom: this.validfrom,
        validto: this.validto,
        usecase: this.usecase
      };
    }

    const result: any = {};
    if(view.includes('id')) { result.id = this.id; }
    if(view.includes('keyvalue')) { result.keyvalue = this.keyvalue; }
    if(view.includes('description')) { result.description = this.description; }
    if(view.includes('validfrom')) { result.validfrom = this.validfrom; }
    if(view.includes('validto')) { result.validto = this.validto; }
    if(view.includes('usecase')) { result.usecase = this.usecase; }
    return result;  
  }

}
