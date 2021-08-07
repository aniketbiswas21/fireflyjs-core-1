import { firestore as __firestore } from "firebase-admin";
import { KeyValueStore } from "../../SchemaTypes/Object/types/KeyValue";

type ConfigValues = string | number | boolean | null | __firestore.Timestamp;

type ConfigPOJO<T extends KeyValueStore> = {
  [k in keyof T & "_id"]: ConfigValues;
};

type ExtConfigPOJO = {
  limit?: number;
  offset?: number;
  startAt?: number;
  orderBy?: string[];
  select?: string[];
};

export { ConfigPOJO, ExtConfigPOJO };
