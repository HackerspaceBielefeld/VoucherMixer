
import { GenericDBObject, TDBObjectView } from '../../db/genericdbobject';


interface IServiceToken {
    tokenvalue: string;
    created: Date;
    validto: Date;
    usecase?: string;
    comment?: string;
}

export class GeneratedDBServiceToken extends GenericDBObject implements IServiceToken {
    
  constructor(
    public tokenvalue: string,
    public created: Date,
    public validto: Date,
    public usecase: string | undefined,
    public comment: string | undefined
    ){
      super();
  }

  static createFromDB(data: any){
      // @ts-ignore
      return new this(data.tokenvalue, data.created, data.validto, data.usecase, data.comment);
  }

  public JSONView(view: TDBObjectView) {
    if(view == null){
      return {
        tokenvalue: this.tokenvalue,
        created: this.created,
        validto: this.validto,
        usecase: this.usecase,
        comment: this.comment
      };
    }

    const result: any = {};
    if(view.includes('tokenvalue')) { result.tokenvalue = this.tokenvalue; }
    if(view.includes('created')) { result.created = this.created; }
    if(view.includes('validto')) { result.validto = this.validto; }
    if(view.includes('usecase')) { result.usecase = this.usecase; }
    if(view.includes('comment')) { result.comment = this.comment; }
    return result;  
  }

}
