

import { GenericDBObject, GenericDBObjectList } from '../db/genericdbobject';
import { GeneratedDBCandidate } from './generated/candidate.model';

export class DBCandidateList extends GenericDBObjectList<DBCandidate> {

}

export class DBCandidate extends GeneratedDBCandidate {

}

