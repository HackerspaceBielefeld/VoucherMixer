
export type TDBObjectView = Array<string> | null;

export abstract class GenericDBObject {
  static createFromDB(data: any): any { };
  JSONView(view: TDBObjectView): any { };
}

export class GenericDBObjectList<T extends GenericDBObject> {
    protected _items: Array<T>;

    public constructor(){//itemtype: {new(): T}) {
        this._items = [];
    }

    public fromDB(data: Object[], gtype: any){
        data.forEach((item, idx) => {
            const obj = gtype!.createFromDB(item);

            this.Add(obj);
        });
    }

    public get length(): number {
        return this._items.length;
    }

    public Item(index: number): T {
        return this._items[index];
    }

    public Add(value: T): void {
        this._items.push(value);
    }

    public RemoveAt(index: number): void {
        this._items.splice(index, 1);
    }

    public Remove(value: T): void {
        let index = this._items.indexOf(value);
        this.RemoveAt(index);
    }

    public JSONView(view: TDBObjectView): any {
        let result = [];
        for (const element of this._items) {
            result.push(element.JSONView(view));
        }
        return result;
    };
}