/* eslint-disable import/no-cycle */
import { firestore as __firestore } from "firebase-admin";
import ObjectSchema from "../SchemaTypes/Object/class";
import Document from "../Document/class";
import { KeyValueStore } from "../SchemaTypes/Object/types/KeyValue";
import { ConfigPOJO, ExtConfigPOJO } from "./types/ConfigPOJO";
import buildQuery from "./utils/buildQuery";
import makeError from "../utils/makeError";
import { QueryErrorTypes } from "./types/error";
import buildExtendedQuery from "./utils/buildExtendedQuery";

class Query<T extends KeyValueStore> {
  private __config: ConfigPOJO<T>;

  private __extConfig: ExtConfigPOJO;

  private __collectionRef: __firestore.CollectionReference;

  private __schema: ObjectSchema<T>;

  constructor(
    input: ConfigPOJO<T>,
    collectionRef: __firestore.CollectionReference,
    schema: ObjectSchema<T>
  ) {
    this.__config = input;
    this.__extConfig = {};
    this.__collectionRef = collectionRef;
    this.__schema = schema;
  }

  public limit = (limit: number) => {
    this.__extConfig.limit = limit;

    return this;
  };

  public offset = (offset: number) => {
    this.__extConfig.offset = offset;

    return this;
  };

  public startAt = (value: number) => {
    this.__extConfig.startAt = value;

    return this;
  };

  public orderBy = (...fields: string[]) => {
    this.__extConfig.orderBy = fields;

    return this;
  };

  public select = (...fields: string[]) => {
    this.__extConfig.select = fields;

    return this;
  };

  public exec = async (): Promise<Document<T>[]> => {
    if (!this.__config) {
      throw new Error("Query not configured");
    }

    let query: __firestore.CollectionReference | __firestore.Query =
      this.__collectionRef;

    Object.keys(this.__config).forEach((key: keyof ConfigPOJO<T>) => {
      query = buildQuery<T>(key, this.__config[key], query);
    });

    query = buildExtendedQuery(query, this.__extConfig);

    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      throw makeError(
        QueryErrorTypes.notfound,
        "Documents are invalid or not found"
      );
    }
    const documents: Document<T>[] = [];

    querySnapshot.forEach((docSnap) => {
      documents.push(
        new Document<T>(
          docSnap.ref as __firestore.DocumentReference<T>,
          this.__schema
        )
      );
    });

    return documents;
  };
}

export default Query;
