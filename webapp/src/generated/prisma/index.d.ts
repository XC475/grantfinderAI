
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model alembic_version
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export type alembic_version = $Result.DefaultSelection<Prisma.$alembic_versionPayload>
/**
 * Model opportunities
 * This model contains row level security and requires additional setup for migrations. Visit https://pris.ly/d/row-level-security for more info.
 */
export type opportunities = $Result.DefaultSelection<Prisma.$opportunitiesPayload>
/**
 * Model User
 * ///// APP SCHEMA ////////
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Organization
 * 
 */
export type Organization = $Result.DefaultSelection<Prisma.$OrganizationPayload>
/**
 * Model SchoolDistrict
 * 
 */
export type SchoolDistrict = $Result.DefaultSelection<Prisma.$SchoolDistrictPayload>
/**
 * Model GrantBookmark
 * 
 */
export type GrantBookmark = $Result.DefaultSelection<Prisma.$GrantBookmarkPayload>
/**
 * Model GrantEligibilityAnalysis
 * 
 */
export type GrantEligibilityAnalysis = $Result.DefaultSelection<Prisma.$GrantEligibilityAnalysisPayload>
/**
 * Model Application
 * 
 */
export type Application = $Result.DefaultSelection<Prisma.$ApplicationPayload>
/**
 * Model AiChat
 * 
 */
export type AiChat = $Result.DefaultSelection<Prisma.$AiChatPayload>
/**
 * Model AiChatMessage
 * 
 */
export type AiChatMessage = $Result.DefaultSelection<Prisma.$AiChatMessagePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const opportunity_status_enum: {
  forecasted: 'forecasted',
  posted: 'posted',
  closed: 'closed',
  archive: 'archive'
};

export type opportunity_status_enum = (typeof opportunity_status_enum)[keyof typeof opportunity_status_enum]


export const OrganizationType: {
  PERSONAL: 'PERSONAL',
  ORGANIZATION: 'ORGANIZATION'
};

export type OrganizationType = (typeof OrganizationType)[keyof typeof OrganizationType]


export const GoNoGoDecision: {
  GO: 'GO',
  NO_GO: 'NO_GO',
  MAYBE: 'MAYBE'
};

export type GoNoGoDecision = (typeof GoNoGoDecision)[keyof typeof GoNoGoDecision]


export const ApplicationStatus: {
  DRAFT: 'DRAFT',
  IN_PROGRESS: 'IN_PROGRESS',
  READY_TO_SUBMIT: 'READY_TO_SUBMIT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  AWARDED: 'AWARDED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]


export const AiChatContext: {
  GENERAL: 'GENERAL',
  APPLICATION: 'APPLICATION',
  GRANT_ANALYSIS: 'GRANT_ANALYSIS',
  DRAFTING: 'DRAFTING',
  ELIGIBILITY: 'ELIGIBILITY'
};

export type AiChatContext = (typeof AiChatContext)[keyof typeof AiChatContext]


export const MessageRole: {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
  SYSTEM: 'SYSTEM'
};

export type MessageRole = (typeof MessageRole)[keyof typeof MessageRole]


export const OrganizationRole: {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER'
};

export type OrganizationRole = (typeof OrganizationRole)[keyof typeof OrganizationRole]

}

export type opportunity_status_enum = $Enums.opportunity_status_enum

export const opportunity_status_enum: typeof $Enums.opportunity_status_enum

export type OrganizationType = $Enums.OrganizationType

export const OrganizationType: typeof $Enums.OrganizationType

export type GoNoGoDecision = $Enums.GoNoGoDecision

export const GoNoGoDecision: typeof $Enums.GoNoGoDecision

export type ApplicationStatus = $Enums.ApplicationStatus

export const ApplicationStatus: typeof $Enums.ApplicationStatus

export type AiChatContext = $Enums.AiChatContext

export const AiChatContext: typeof $Enums.AiChatContext

export type MessageRole = $Enums.MessageRole

export const MessageRole: typeof $Enums.MessageRole

export type OrganizationRole = $Enums.OrganizationRole

export const OrganizationRole: typeof $Enums.OrganizationRole

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Alembic_versions
 * const alembic_versions = await prisma.alembic_version.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Alembic_versions
   * const alembic_versions = await prisma.alembic_version.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.alembic_version`: Exposes CRUD operations for the **alembic_version** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Alembic_versions
    * const alembic_versions = await prisma.alembic_version.findMany()
    * ```
    */
  get alembic_version(): Prisma.alembic_versionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.opportunities`: Exposes CRUD operations for the **opportunities** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Opportunities
    * const opportunities = await prisma.opportunities.findMany()
    * ```
    */
  get opportunities(): Prisma.opportunitiesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.organization`: Exposes CRUD operations for the **Organization** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organizations
    * const organizations = await prisma.organization.findMany()
    * ```
    */
  get organization(): Prisma.OrganizationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.schoolDistrict`: Exposes CRUD operations for the **SchoolDistrict** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SchoolDistricts
    * const schoolDistricts = await prisma.schoolDistrict.findMany()
    * ```
    */
  get schoolDistrict(): Prisma.SchoolDistrictDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.grantBookmark`: Exposes CRUD operations for the **GrantBookmark** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GrantBookmarks
    * const grantBookmarks = await prisma.grantBookmark.findMany()
    * ```
    */
  get grantBookmark(): Prisma.GrantBookmarkDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.grantEligibilityAnalysis`: Exposes CRUD operations for the **GrantEligibilityAnalysis** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GrantEligibilityAnalyses
    * const grantEligibilityAnalyses = await prisma.grantEligibilityAnalysis.findMany()
    * ```
    */
  get grantEligibilityAnalysis(): Prisma.GrantEligibilityAnalysisDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.application`: Exposes CRUD operations for the **Application** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Applications
    * const applications = await prisma.application.findMany()
    * ```
    */
  get application(): Prisma.ApplicationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.aiChat`: Exposes CRUD operations for the **AiChat** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AiChats
    * const aiChats = await prisma.aiChat.findMany()
    * ```
    */
  get aiChat(): Prisma.AiChatDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.aiChatMessage`: Exposes CRUD operations for the **AiChatMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AiChatMessages
    * const aiChatMessages = await prisma.aiChatMessage.findMany()
    * ```
    */
  get aiChatMessage(): Prisma.AiChatMessageDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    alembic_version: 'alembic_version',
    opportunities: 'opportunities',
    User: 'User',
    Organization: 'Organization',
    SchoolDistrict: 'SchoolDistrict',
    GrantBookmark: 'GrantBookmark',
    GrantEligibilityAnalysis: 'GrantEligibilityAnalysis',
    Application: 'Application',
    AiChat: 'AiChat',
    AiChatMessage: 'AiChatMessage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "alembic_version" | "opportunities" | "user" | "organization" | "schoolDistrict" | "grantBookmark" | "grantEligibilityAnalysis" | "application" | "aiChat" | "aiChatMessage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      alembic_version: {
        payload: Prisma.$alembic_versionPayload<ExtArgs>
        fields: Prisma.alembic_versionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.alembic_versionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.alembic_versionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload>
          }
          findFirst: {
            args: Prisma.alembic_versionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.alembic_versionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload>
          }
          findMany: {
            args: Prisma.alembic_versionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload>[]
          }
          create: {
            args: Prisma.alembic_versionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload>
          }
          createMany: {
            args: Prisma.alembic_versionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.alembic_versionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload>[]
          }
          delete: {
            args: Prisma.alembic_versionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload>
          }
          update: {
            args: Prisma.alembic_versionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload>
          }
          deleteMany: {
            args: Prisma.alembic_versionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.alembic_versionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.alembic_versionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload>[]
          }
          upsert: {
            args: Prisma.alembic_versionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$alembic_versionPayload>
          }
          aggregate: {
            args: Prisma.Alembic_versionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAlembic_version>
          }
          groupBy: {
            args: Prisma.alembic_versionGroupByArgs<ExtArgs>
            result: $Utils.Optional<Alembic_versionGroupByOutputType>[]
          }
          count: {
            args: Prisma.alembic_versionCountArgs<ExtArgs>
            result: $Utils.Optional<Alembic_versionCountAggregateOutputType> | number
          }
        }
      }
      opportunities: {
        payload: Prisma.$opportunitiesPayload<ExtArgs>
        fields: Prisma.opportunitiesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.opportunitiesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.opportunitiesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload>
          }
          findFirst: {
            args: Prisma.opportunitiesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.opportunitiesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload>
          }
          findMany: {
            args: Prisma.opportunitiesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload>[]
          }
          create: {
            args: Prisma.opportunitiesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload>
          }
          createMany: {
            args: Prisma.opportunitiesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.opportunitiesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload>[]
          }
          delete: {
            args: Prisma.opportunitiesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload>
          }
          update: {
            args: Prisma.opportunitiesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload>
          }
          deleteMany: {
            args: Prisma.opportunitiesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.opportunitiesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.opportunitiesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload>[]
          }
          upsert: {
            args: Prisma.opportunitiesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$opportunitiesPayload>
          }
          aggregate: {
            args: Prisma.OpportunitiesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOpportunities>
          }
          groupBy: {
            args: Prisma.opportunitiesGroupByArgs<ExtArgs>
            result: $Utils.Optional<OpportunitiesGroupByOutputType>[]
          }
          count: {
            args: Prisma.opportunitiesCountArgs<ExtArgs>
            result: $Utils.Optional<OpportunitiesCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Organization: {
        payload: Prisma.$OrganizationPayload<ExtArgs>
        fields: Prisma.OrganizationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findFirst: {
            args: Prisma.OrganizationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findMany: {
            args: Prisma.OrganizationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          create: {
            args: Prisma.OrganizationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          createMany: {
            args: Prisma.OrganizationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          delete: {
            args: Prisma.OrganizationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          update: {
            args: Prisma.OrganizationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          deleteMany: {
            args: Prisma.OrganizationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          upsert: {
            args: Prisma.OrganizationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          aggregate: {
            args: Prisma.OrganizationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganization>
          }
          groupBy: {
            args: Prisma.OrganizationGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationCountAggregateOutputType> | number
          }
        }
      }
      SchoolDistrict: {
        payload: Prisma.$SchoolDistrictPayload<ExtArgs>
        fields: Prisma.SchoolDistrictFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SchoolDistrictFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SchoolDistrictFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload>
          }
          findFirst: {
            args: Prisma.SchoolDistrictFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SchoolDistrictFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload>
          }
          findMany: {
            args: Prisma.SchoolDistrictFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload>[]
          }
          create: {
            args: Prisma.SchoolDistrictCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload>
          }
          createMany: {
            args: Prisma.SchoolDistrictCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SchoolDistrictCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload>[]
          }
          delete: {
            args: Prisma.SchoolDistrictDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload>
          }
          update: {
            args: Prisma.SchoolDistrictUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload>
          }
          deleteMany: {
            args: Prisma.SchoolDistrictDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SchoolDistrictUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SchoolDistrictUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload>[]
          }
          upsert: {
            args: Prisma.SchoolDistrictUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolDistrictPayload>
          }
          aggregate: {
            args: Prisma.SchoolDistrictAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSchoolDistrict>
          }
          groupBy: {
            args: Prisma.SchoolDistrictGroupByArgs<ExtArgs>
            result: $Utils.Optional<SchoolDistrictGroupByOutputType>[]
          }
          count: {
            args: Prisma.SchoolDistrictCountArgs<ExtArgs>
            result: $Utils.Optional<SchoolDistrictCountAggregateOutputType> | number
          }
        }
      }
      GrantBookmark: {
        payload: Prisma.$GrantBookmarkPayload<ExtArgs>
        fields: Prisma.GrantBookmarkFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GrantBookmarkFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GrantBookmarkFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload>
          }
          findFirst: {
            args: Prisma.GrantBookmarkFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GrantBookmarkFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload>
          }
          findMany: {
            args: Prisma.GrantBookmarkFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload>[]
          }
          create: {
            args: Prisma.GrantBookmarkCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload>
          }
          createMany: {
            args: Prisma.GrantBookmarkCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GrantBookmarkCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload>[]
          }
          delete: {
            args: Prisma.GrantBookmarkDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload>
          }
          update: {
            args: Prisma.GrantBookmarkUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload>
          }
          deleteMany: {
            args: Prisma.GrantBookmarkDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GrantBookmarkUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GrantBookmarkUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload>[]
          }
          upsert: {
            args: Prisma.GrantBookmarkUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantBookmarkPayload>
          }
          aggregate: {
            args: Prisma.GrantBookmarkAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGrantBookmark>
          }
          groupBy: {
            args: Prisma.GrantBookmarkGroupByArgs<ExtArgs>
            result: $Utils.Optional<GrantBookmarkGroupByOutputType>[]
          }
          count: {
            args: Prisma.GrantBookmarkCountArgs<ExtArgs>
            result: $Utils.Optional<GrantBookmarkCountAggregateOutputType> | number
          }
        }
      }
      GrantEligibilityAnalysis: {
        payload: Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>
        fields: Prisma.GrantEligibilityAnalysisFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GrantEligibilityAnalysisFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GrantEligibilityAnalysisFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload>
          }
          findFirst: {
            args: Prisma.GrantEligibilityAnalysisFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GrantEligibilityAnalysisFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload>
          }
          findMany: {
            args: Prisma.GrantEligibilityAnalysisFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload>[]
          }
          create: {
            args: Prisma.GrantEligibilityAnalysisCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload>
          }
          createMany: {
            args: Prisma.GrantEligibilityAnalysisCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GrantEligibilityAnalysisCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload>[]
          }
          delete: {
            args: Prisma.GrantEligibilityAnalysisDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload>
          }
          update: {
            args: Prisma.GrantEligibilityAnalysisUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload>
          }
          deleteMany: {
            args: Prisma.GrantEligibilityAnalysisDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GrantEligibilityAnalysisUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GrantEligibilityAnalysisUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload>[]
          }
          upsert: {
            args: Prisma.GrantEligibilityAnalysisUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GrantEligibilityAnalysisPayload>
          }
          aggregate: {
            args: Prisma.GrantEligibilityAnalysisAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGrantEligibilityAnalysis>
          }
          groupBy: {
            args: Prisma.GrantEligibilityAnalysisGroupByArgs<ExtArgs>
            result: $Utils.Optional<GrantEligibilityAnalysisGroupByOutputType>[]
          }
          count: {
            args: Prisma.GrantEligibilityAnalysisCountArgs<ExtArgs>
            result: $Utils.Optional<GrantEligibilityAnalysisCountAggregateOutputType> | number
          }
        }
      }
      Application: {
        payload: Prisma.$ApplicationPayload<ExtArgs>
        fields: Prisma.ApplicationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApplicationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApplicationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          findFirst: {
            args: Prisma.ApplicationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApplicationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          findMany: {
            args: Prisma.ApplicationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>[]
          }
          create: {
            args: Prisma.ApplicationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          createMany: {
            args: Prisma.ApplicationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApplicationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>[]
          }
          delete: {
            args: Prisma.ApplicationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          update: {
            args: Prisma.ApplicationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          deleteMany: {
            args: Prisma.ApplicationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApplicationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApplicationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>[]
          }
          upsert: {
            args: Prisma.ApplicationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApplicationPayload>
          }
          aggregate: {
            args: Prisma.ApplicationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApplication>
          }
          groupBy: {
            args: Prisma.ApplicationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApplicationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApplicationCountArgs<ExtArgs>
            result: $Utils.Optional<ApplicationCountAggregateOutputType> | number
          }
        }
      }
      AiChat: {
        payload: Prisma.$AiChatPayload<ExtArgs>
        fields: Prisma.AiChatFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AiChatFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AiChatFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload>
          }
          findFirst: {
            args: Prisma.AiChatFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AiChatFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload>
          }
          findMany: {
            args: Prisma.AiChatFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload>[]
          }
          create: {
            args: Prisma.AiChatCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload>
          }
          createMany: {
            args: Prisma.AiChatCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AiChatCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload>[]
          }
          delete: {
            args: Prisma.AiChatDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload>
          }
          update: {
            args: Prisma.AiChatUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload>
          }
          deleteMany: {
            args: Prisma.AiChatDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AiChatUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AiChatUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload>[]
          }
          upsert: {
            args: Prisma.AiChatUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatPayload>
          }
          aggregate: {
            args: Prisma.AiChatAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAiChat>
          }
          groupBy: {
            args: Prisma.AiChatGroupByArgs<ExtArgs>
            result: $Utils.Optional<AiChatGroupByOutputType>[]
          }
          count: {
            args: Prisma.AiChatCountArgs<ExtArgs>
            result: $Utils.Optional<AiChatCountAggregateOutputType> | number
          }
        }
      }
      AiChatMessage: {
        payload: Prisma.$AiChatMessagePayload<ExtArgs>
        fields: Prisma.AiChatMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AiChatMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AiChatMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload>
          }
          findFirst: {
            args: Prisma.AiChatMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AiChatMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload>
          }
          findMany: {
            args: Prisma.AiChatMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload>[]
          }
          create: {
            args: Prisma.AiChatMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload>
          }
          createMany: {
            args: Prisma.AiChatMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AiChatMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload>[]
          }
          delete: {
            args: Prisma.AiChatMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload>
          }
          update: {
            args: Prisma.AiChatMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload>
          }
          deleteMany: {
            args: Prisma.AiChatMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AiChatMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AiChatMessageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload>[]
          }
          upsert: {
            args: Prisma.AiChatMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AiChatMessagePayload>
          }
          aggregate: {
            args: Prisma.AiChatMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAiChatMessage>
          }
          groupBy: {
            args: Prisma.AiChatMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<AiChatMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.AiChatMessageCountArgs<ExtArgs>
            result: $Utils.Optional<AiChatMessageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    alembic_version?: alembic_versionOmit
    opportunities?: opportunitiesOmit
    user?: UserOmit
    organization?: OrganizationOmit
    schoolDistrict?: SchoolDistrictOmit
    grantBookmark?: GrantBookmarkOmit
    grantEligibilityAnalysis?: GrantEligibilityAnalysisOmit
    application?: ApplicationOmit
    aiChat?: AiChatOmit
    aiChatMessage?: AiChatMessageOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    aiChats: number
    grantBookmarks: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    aiChats?: boolean | UserCountOutputTypeCountAiChatsArgs
    grantBookmarks?: boolean | UserCountOutputTypeCountGrantBookmarksArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAiChatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AiChatWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountGrantBookmarksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GrantBookmarkWhereInput
  }


  /**
   * Count Type OrganizationCountOutputType
   */

  export type OrganizationCountOutputType = {
    aiChats: number
    applications: number
    grantBookmarks: number
    eligibilityAnalyses: number
  }

  export type OrganizationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    aiChats?: boolean | OrganizationCountOutputTypeCountAiChatsArgs
    applications?: boolean | OrganizationCountOutputTypeCountApplicationsArgs
    grantBookmarks?: boolean | OrganizationCountOutputTypeCountGrantBookmarksArgs
    eligibilityAnalyses?: boolean | OrganizationCountOutputTypeCountEligibilityAnalysesArgs
  }

  // Custom InputTypes
  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrganizationCountOutputType
     */
    select?: OrganizationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountAiChatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AiChatWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountApplicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApplicationWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountGrantBookmarksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GrantBookmarkWhereInput
  }

  /**
   * OrganizationCountOutputType without action
   */
  export type OrganizationCountOutputTypeCountEligibilityAnalysesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GrantEligibilityAnalysisWhereInput
  }


  /**
   * Count Type SchoolDistrictCountOutputType
   */

  export type SchoolDistrictCountOutputType = {
    organizations: number
  }

  export type SchoolDistrictCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organizations?: boolean | SchoolDistrictCountOutputTypeCountOrganizationsArgs
  }

  // Custom InputTypes
  /**
   * SchoolDistrictCountOutputType without action
   */
  export type SchoolDistrictCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrictCountOutputType
     */
    select?: SchoolDistrictCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SchoolDistrictCountOutputType without action
   */
  export type SchoolDistrictCountOutputTypeCountOrganizationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationWhereInput
  }


  /**
   * Count Type ApplicationCountOutputType
   */

  export type ApplicationCountOutputType = {
    aiChats: number
  }

  export type ApplicationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    aiChats?: boolean | ApplicationCountOutputTypeCountAiChatsArgs
  }

  // Custom InputTypes
  /**
   * ApplicationCountOutputType without action
   */
  export type ApplicationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationCountOutputType
     */
    select?: ApplicationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ApplicationCountOutputType without action
   */
  export type ApplicationCountOutputTypeCountAiChatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AiChatWhereInput
  }


  /**
   * Count Type AiChatCountOutputType
   */

  export type AiChatCountOutputType = {
    messages: number
  }

  export type AiChatCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | AiChatCountOutputTypeCountMessagesArgs
  }

  // Custom InputTypes
  /**
   * AiChatCountOutputType without action
   */
  export type AiChatCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatCountOutputType
     */
    select?: AiChatCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AiChatCountOutputType without action
   */
  export type AiChatCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AiChatMessageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model alembic_version
   */

  export type AggregateAlembic_version = {
    _count: Alembic_versionCountAggregateOutputType | null
    _min: Alembic_versionMinAggregateOutputType | null
    _max: Alembic_versionMaxAggregateOutputType | null
  }

  export type Alembic_versionMinAggregateOutputType = {
    version_num: string | null
  }

  export type Alembic_versionMaxAggregateOutputType = {
    version_num: string | null
  }

  export type Alembic_versionCountAggregateOutputType = {
    version_num: number
    _all: number
  }


  export type Alembic_versionMinAggregateInputType = {
    version_num?: true
  }

  export type Alembic_versionMaxAggregateInputType = {
    version_num?: true
  }

  export type Alembic_versionCountAggregateInputType = {
    version_num?: true
    _all?: true
  }

  export type Alembic_versionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which alembic_version to aggregate.
     */
    where?: alembic_versionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of alembic_versions to fetch.
     */
    orderBy?: alembic_versionOrderByWithRelationInput | alembic_versionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: alembic_versionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` alembic_versions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` alembic_versions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned alembic_versions
    **/
    _count?: true | Alembic_versionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Alembic_versionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Alembic_versionMaxAggregateInputType
  }

  export type GetAlembic_versionAggregateType<T extends Alembic_versionAggregateArgs> = {
        [P in keyof T & keyof AggregateAlembic_version]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlembic_version[P]>
      : GetScalarType<T[P], AggregateAlembic_version[P]>
  }




  export type alembic_versionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: alembic_versionWhereInput
    orderBy?: alembic_versionOrderByWithAggregationInput | alembic_versionOrderByWithAggregationInput[]
    by: Alembic_versionScalarFieldEnum[] | Alembic_versionScalarFieldEnum
    having?: alembic_versionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Alembic_versionCountAggregateInputType | true
    _min?: Alembic_versionMinAggregateInputType
    _max?: Alembic_versionMaxAggregateInputType
  }

  export type Alembic_versionGroupByOutputType = {
    version_num: string
    _count: Alembic_versionCountAggregateOutputType | null
    _min: Alembic_versionMinAggregateOutputType | null
    _max: Alembic_versionMaxAggregateOutputType | null
  }

  type GetAlembic_versionGroupByPayload<T extends alembic_versionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Alembic_versionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Alembic_versionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Alembic_versionGroupByOutputType[P]>
            : GetScalarType<T[P], Alembic_versionGroupByOutputType[P]>
        }
      >
    >


  export type alembic_versionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    version_num?: boolean
  }, ExtArgs["result"]["alembic_version"]>

  export type alembic_versionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    version_num?: boolean
  }, ExtArgs["result"]["alembic_version"]>

  export type alembic_versionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    version_num?: boolean
  }, ExtArgs["result"]["alembic_version"]>

  export type alembic_versionSelectScalar = {
    version_num?: boolean
  }

  export type alembic_versionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"version_num", ExtArgs["result"]["alembic_version"]>

  export type $alembic_versionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "alembic_version"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      version_num: string
    }, ExtArgs["result"]["alembic_version"]>
    composites: {}
  }

  type alembic_versionGetPayload<S extends boolean | null | undefined | alembic_versionDefaultArgs> = $Result.GetResult<Prisma.$alembic_versionPayload, S>

  type alembic_versionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<alembic_versionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Alembic_versionCountAggregateInputType | true
    }

  export interface alembic_versionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['alembic_version'], meta: { name: 'alembic_version' } }
    /**
     * Find zero or one Alembic_version that matches the filter.
     * @param {alembic_versionFindUniqueArgs} args - Arguments to find a Alembic_version
     * @example
     * // Get one Alembic_version
     * const alembic_version = await prisma.alembic_version.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends alembic_versionFindUniqueArgs>(args: SelectSubset<T, alembic_versionFindUniqueArgs<ExtArgs>>): Prisma__alembic_versionClient<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Alembic_version that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {alembic_versionFindUniqueOrThrowArgs} args - Arguments to find a Alembic_version
     * @example
     * // Get one Alembic_version
     * const alembic_version = await prisma.alembic_version.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends alembic_versionFindUniqueOrThrowArgs>(args: SelectSubset<T, alembic_versionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__alembic_versionClient<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Alembic_version that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {alembic_versionFindFirstArgs} args - Arguments to find a Alembic_version
     * @example
     * // Get one Alembic_version
     * const alembic_version = await prisma.alembic_version.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends alembic_versionFindFirstArgs>(args?: SelectSubset<T, alembic_versionFindFirstArgs<ExtArgs>>): Prisma__alembic_versionClient<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Alembic_version that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {alembic_versionFindFirstOrThrowArgs} args - Arguments to find a Alembic_version
     * @example
     * // Get one Alembic_version
     * const alembic_version = await prisma.alembic_version.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends alembic_versionFindFirstOrThrowArgs>(args?: SelectSubset<T, alembic_versionFindFirstOrThrowArgs<ExtArgs>>): Prisma__alembic_versionClient<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Alembic_versions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {alembic_versionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Alembic_versions
     * const alembic_versions = await prisma.alembic_version.findMany()
     * 
     * // Get first 10 Alembic_versions
     * const alembic_versions = await prisma.alembic_version.findMany({ take: 10 })
     * 
     * // Only select the `version_num`
     * const alembic_versionWithVersion_numOnly = await prisma.alembic_version.findMany({ select: { version_num: true } })
     * 
     */
    findMany<T extends alembic_versionFindManyArgs>(args?: SelectSubset<T, alembic_versionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Alembic_version.
     * @param {alembic_versionCreateArgs} args - Arguments to create a Alembic_version.
     * @example
     * // Create one Alembic_version
     * const Alembic_version = await prisma.alembic_version.create({
     *   data: {
     *     // ... data to create a Alembic_version
     *   }
     * })
     * 
     */
    create<T extends alembic_versionCreateArgs>(args: SelectSubset<T, alembic_versionCreateArgs<ExtArgs>>): Prisma__alembic_versionClient<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Alembic_versions.
     * @param {alembic_versionCreateManyArgs} args - Arguments to create many Alembic_versions.
     * @example
     * // Create many Alembic_versions
     * const alembic_version = await prisma.alembic_version.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends alembic_versionCreateManyArgs>(args?: SelectSubset<T, alembic_versionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Alembic_versions and returns the data saved in the database.
     * @param {alembic_versionCreateManyAndReturnArgs} args - Arguments to create many Alembic_versions.
     * @example
     * // Create many Alembic_versions
     * const alembic_version = await prisma.alembic_version.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Alembic_versions and only return the `version_num`
     * const alembic_versionWithVersion_numOnly = await prisma.alembic_version.createManyAndReturn({
     *   select: { version_num: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends alembic_versionCreateManyAndReturnArgs>(args?: SelectSubset<T, alembic_versionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Alembic_version.
     * @param {alembic_versionDeleteArgs} args - Arguments to delete one Alembic_version.
     * @example
     * // Delete one Alembic_version
     * const Alembic_version = await prisma.alembic_version.delete({
     *   where: {
     *     // ... filter to delete one Alembic_version
     *   }
     * })
     * 
     */
    delete<T extends alembic_versionDeleteArgs>(args: SelectSubset<T, alembic_versionDeleteArgs<ExtArgs>>): Prisma__alembic_versionClient<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Alembic_version.
     * @param {alembic_versionUpdateArgs} args - Arguments to update one Alembic_version.
     * @example
     * // Update one Alembic_version
     * const alembic_version = await prisma.alembic_version.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends alembic_versionUpdateArgs>(args: SelectSubset<T, alembic_versionUpdateArgs<ExtArgs>>): Prisma__alembic_versionClient<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Alembic_versions.
     * @param {alembic_versionDeleteManyArgs} args - Arguments to filter Alembic_versions to delete.
     * @example
     * // Delete a few Alembic_versions
     * const { count } = await prisma.alembic_version.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends alembic_versionDeleteManyArgs>(args?: SelectSubset<T, alembic_versionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Alembic_versions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {alembic_versionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Alembic_versions
     * const alembic_version = await prisma.alembic_version.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends alembic_versionUpdateManyArgs>(args: SelectSubset<T, alembic_versionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Alembic_versions and returns the data updated in the database.
     * @param {alembic_versionUpdateManyAndReturnArgs} args - Arguments to update many Alembic_versions.
     * @example
     * // Update many Alembic_versions
     * const alembic_version = await prisma.alembic_version.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Alembic_versions and only return the `version_num`
     * const alembic_versionWithVersion_numOnly = await prisma.alembic_version.updateManyAndReturn({
     *   select: { version_num: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends alembic_versionUpdateManyAndReturnArgs>(args: SelectSubset<T, alembic_versionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Alembic_version.
     * @param {alembic_versionUpsertArgs} args - Arguments to update or create a Alembic_version.
     * @example
     * // Update or create a Alembic_version
     * const alembic_version = await prisma.alembic_version.upsert({
     *   create: {
     *     // ... data to create a Alembic_version
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Alembic_version we want to update
     *   }
     * })
     */
    upsert<T extends alembic_versionUpsertArgs>(args: SelectSubset<T, alembic_versionUpsertArgs<ExtArgs>>): Prisma__alembic_versionClient<$Result.GetResult<Prisma.$alembic_versionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Alembic_versions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {alembic_versionCountArgs} args - Arguments to filter Alembic_versions to count.
     * @example
     * // Count the number of Alembic_versions
     * const count = await prisma.alembic_version.count({
     *   where: {
     *     // ... the filter for the Alembic_versions we want to count
     *   }
     * })
    **/
    count<T extends alembic_versionCountArgs>(
      args?: Subset<T, alembic_versionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Alembic_versionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Alembic_version.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Alembic_versionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Alembic_versionAggregateArgs>(args: Subset<T, Alembic_versionAggregateArgs>): Prisma.PrismaPromise<GetAlembic_versionAggregateType<T>>

    /**
     * Group by Alembic_version.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {alembic_versionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends alembic_versionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: alembic_versionGroupByArgs['orderBy'] }
        : { orderBy?: alembic_versionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, alembic_versionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlembic_versionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the alembic_version model
   */
  readonly fields: alembic_versionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for alembic_version.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__alembic_versionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the alembic_version model
   */
  interface alembic_versionFieldRefs {
    readonly version_num: FieldRef<"alembic_version", 'String'>
  }
    

  // Custom InputTypes
  /**
   * alembic_version findUnique
   */
  export type alembic_versionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * Filter, which alembic_version to fetch.
     */
    where: alembic_versionWhereUniqueInput
  }

  /**
   * alembic_version findUniqueOrThrow
   */
  export type alembic_versionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * Filter, which alembic_version to fetch.
     */
    where: alembic_versionWhereUniqueInput
  }

  /**
   * alembic_version findFirst
   */
  export type alembic_versionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * Filter, which alembic_version to fetch.
     */
    where?: alembic_versionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of alembic_versions to fetch.
     */
    orderBy?: alembic_versionOrderByWithRelationInput | alembic_versionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for alembic_versions.
     */
    cursor?: alembic_versionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` alembic_versions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` alembic_versions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of alembic_versions.
     */
    distinct?: Alembic_versionScalarFieldEnum | Alembic_versionScalarFieldEnum[]
  }

  /**
   * alembic_version findFirstOrThrow
   */
  export type alembic_versionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * Filter, which alembic_version to fetch.
     */
    where?: alembic_versionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of alembic_versions to fetch.
     */
    orderBy?: alembic_versionOrderByWithRelationInput | alembic_versionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for alembic_versions.
     */
    cursor?: alembic_versionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` alembic_versions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` alembic_versions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of alembic_versions.
     */
    distinct?: Alembic_versionScalarFieldEnum | Alembic_versionScalarFieldEnum[]
  }

  /**
   * alembic_version findMany
   */
  export type alembic_versionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * Filter, which alembic_versions to fetch.
     */
    where?: alembic_versionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of alembic_versions to fetch.
     */
    orderBy?: alembic_versionOrderByWithRelationInput | alembic_versionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing alembic_versions.
     */
    cursor?: alembic_versionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` alembic_versions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` alembic_versions.
     */
    skip?: number
    distinct?: Alembic_versionScalarFieldEnum | Alembic_versionScalarFieldEnum[]
  }

  /**
   * alembic_version create
   */
  export type alembic_versionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * The data needed to create a alembic_version.
     */
    data: XOR<alembic_versionCreateInput, alembic_versionUncheckedCreateInput>
  }

  /**
   * alembic_version createMany
   */
  export type alembic_versionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many alembic_versions.
     */
    data: alembic_versionCreateManyInput | alembic_versionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * alembic_version createManyAndReturn
   */
  export type alembic_versionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * The data used to create many alembic_versions.
     */
    data: alembic_versionCreateManyInput | alembic_versionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * alembic_version update
   */
  export type alembic_versionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * The data needed to update a alembic_version.
     */
    data: XOR<alembic_versionUpdateInput, alembic_versionUncheckedUpdateInput>
    /**
     * Choose, which alembic_version to update.
     */
    where: alembic_versionWhereUniqueInput
  }

  /**
   * alembic_version updateMany
   */
  export type alembic_versionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update alembic_versions.
     */
    data: XOR<alembic_versionUpdateManyMutationInput, alembic_versionUncheckedUpdateManyInput>
    /**
     * Filter which alembic_versions to update
     */
    where?: alembic_versionWhereInput
    /**
     * Limit how many alembic_versions to update.
     */
    limit?: number
  }

  /**
   * alembic_version updateManyAndReturn
   */
  export type alembic_versionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * The data used to update alembic_versions.
     */
    data: XOR<alembic_versionUpdateManyMutationInput, alembic_versionUncheckedUpdateManyInput>
    /**
     * Filter which alembic_versions to update
     */
    where?: alembic_versionWhereInput
    /**
     * Limit how many alembic_versions to update.
     */
    limit?: number
  }

  /**
   * alembic_version upsert
   */
  export type alembic_versionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * The filter to search for the alembic_version to update in case it exists.
     */
    where: alembic_versionWhereUniqueInput
    /**
     * In case the alembic_version found by the `where` argument doesn't exist, create a new alembic_version with this data.
     */
    create: XOR<alembic_versionCreateInput, alembic_versionUncheckedCreateInput>
    /**
     * In case the alembic_version was found with the provided `where` argument, update it with this data.
     */
    update: XOR<alembic_versionUpdateInput, alembic_versionUncheckedUpdateInput>
  }

  /**
   * alembic_version delete
   */
  export type alembic_versionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
    /**
     * Filter which alembic_version to delete.
     */
    where: alembic_versionWhereUniqueInput
  }

  /**
   * alembic_version deleteMany
   */
  export type alembic_versionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which alembic_versions to delete
     */
    where?: alembic_versionWhereInput
    /**
     * Limit how many alembic_versions to delete.
     */
    limit?: number
  }

  /**
   * alembic_version without action
   */
  export type alembic_versionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the alembic_version
     */
    select?: alembic_versionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the alembic_version
     */
    omit?: alembic_versionOmit<ExtArgs> | null
  }


  /**
   * Model opportunities
   */

  export type AggregateOpportunities = {
    _count: OpportunitiesCountAggregateOutputType | null
    _avg: OpportunitiesAvgAggregateOutputType | null
    _sum: OpportunitiesSumAggregateOutputType | null
    _min: OpportunitiesMinAggregateOutputType | null
    _max: OpportunitiesMaxAggregateOutputType | null
  }

  export type OpportunitiesAvgAggregateOutputType = {
    id: number | null
    fiscal_year: number | null
    award_max: number | null
    award_min: number | null
    total_funding_amount: number | null
    relevance_score: number | null
  }

  export type OpportunitiesSumAggregateOutputType = {
    id: number | null
    fiscal_year: number | null
    award_max: number | null
    award_min: number | null
    total_funding_amount: number | null
    relevance_score: number | null
  }

  export type OpportunitiesMinAggregateOutputType = {
    id: number | null
    source: string | null
    state_code: string | null
    source_grant_id: string | null
    status: $Enums.opportunity_status_enum | null
    title: string | null
    description: string | null
    description_summary: string | null
    agency: string | null
    funding_instrument: string | null
    category: string | null
    fiscal_year: number | null
    post_date: Date | null
    close_date: Date | null
    archive_date: Date | null
    cost_sharing: boolean | null
    award_max: number | null
    award_min: number | null
    total_funding_amount: number | null
    eligibility: string | null
    eligibility_summary: string | null
    last_updated: Date | null
    contact_name: string | null
    contact_email: string | null
    contact_phone: string | null
    url: string | null
    relevance_score: number | null
  }

  export type OpportunitiesMaxAggregateOutputType = {
    id: number | null
    source: string | null
    state_code: string | null
    source_grant_id: string | null
    status: $Enums.opportunity_status_enum | null
    title: string | null
    description: string | null
    description_summary: string | null
    agency: string | null
    funding_instrument: string | null
    category: string | null
    fiscal_year: number | null
    post_date: Date | null
    close_date: Date | null
    archive_date: Date | null
    cost_sharing: boolean | null
    award_max: number | null
    award_min: number | null
    total_funding_amount: number | null
    eligibility: string | null
    eligibility_summary: string | null
    last_updated: Date | null
    contact_name: string | null
    contact_email: string | null
    contact_phone: string | null
    url: string | null
    relevance_score: number | null
  }

  export type OpportunitiesCountAggregateOutputType = {
    id: number
    source: number
    state_code: number
    source_grant_id: number
    status: number
    title: number
    description: number
    description_summary: number
    agency: number
    funding_instrument: number
    category: number
    fiscal_year: number
    post_date: number
    close_date: number
    archive_date: number
    cost_sharing: number
    award_max: number
    award_min: number
    total_funding_amount: number
    eligibility: number
    eligibility_summary: number
    last_updated: number
    contact_name: number
    contact_email: number
    contact_phone: number
    url: number
    attachments: number
    extra: number
    relevance_score: number
    _all: number
  }


  export type OpportunitiesAvgAggregateInputType = {
    id?: true
    fiscal_year?: true
    award_max?: true
    award_min?: true
    total_funding_amount?: true
    relevance_score?: true
  }

  export type OpportunitiesSumAggregateInputType = {
    id?: true
    fiscal_year?: true
    award_max?: true
    award_min?: true
    total_funding_amount?: true
    relevance_score?: true
  }

  export type OpportunitiesMinAggregateInputType = {
    id?: true
    source?: true
    state_code?: true
    source_grant_id?: true
    status?: true
    title?: true
    description?: true
    description_summary?: true
    agency?: true
    funding_instrument?: true
    category?: true
    fiscal_year?: true
    post_date?: true
    close_date?: true
    archive_date?: true
    cost_sharing?: true
    award_max?: true
    award_min?: true
    total_funding_amount?: true
    eligibility?: true
    eligibility_summary?: true
    last_updated?: true
    contact_name?: true
    contact_email?: true
    contact_phone?: true
    url?: true
    relevance_score?: true
  }

  export type OpportunitiesMaxAggregateInputType = {
    id?: true
    source?: true
    state_code?: true
    source_grant_id?: true
    status?: true
    title?: true
    description?: true
    description_summary?: true
    agency?: true
    funding_instrument?: true
    category?: true
    fiscal_year?: true
    post_date?: true
    close_date?: true
    archive_date?: true
    cost_sharing?: true
    award_max?: true
    award_min?: true
    total_funding_amount?: true
    eligibility?: true
    eligibility_summary?: true
    last_updated?: true
    contact_name?: true
    contact_email?: true
    contact_phone?: true
    url?: true
    relevance_score?: true
  }

  export type OpportunitiesCountAggregateInputType = {
    id?: true
    source?: true
    state_code?: true
    source_grant_id?: true
    status?: true
    title?: true
    description?: true
    description_summary?: true
    agency?: true
    funding_instrument?: true
    category?: true
    fiscal_year?: true
    post_date?: true
    close_date?: true
    archive_date?: true
    cost_sharing?: true
    award_max?: true
    award_min?: true
    total_funding_amount?: true
    eligibility?: true
    eligibility_summary?: true
    last_updated?: true
    contact_name?: true
    contact_email?: true
    contact_phone?: true
    url?: true
    attachments?: true
    extra?: true
    relevance_score?: true
    _all?: true
  }

  export type OpportunitiesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which opportunities to aggregate.
     */
    where?: opportunitiesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of opportunities to fetch.
     */
    orderBy?: opportunitiesOrderByWithRelationInput | opportunitiesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: opportunitiesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` opportunities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` opportunities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned opportunities
    **/
    _count?: true | OpportunitiesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OpportunitiesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OpportunitiesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OpportunitiesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OpportunitiesMaxAggregateInputType
  }

  export type GetOpportunitiesAggregateType<T extends OpportunitiesAggregateArgs> = {
        [P in keyof T & keyof AggregateOpportunities]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOpportunities[P]>
      : GetScalarType<T[P], AggregateOpportunities[P]>
  }




  export type opportunitiesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: opportunitiesWhereInput
    orderBy?: opportunitiesOrderByWithAggregationInput | opportunitiesOrderByWithAggregationInput[]
    by: OpportunitiesScalarFieldEnum[] | OpportunitiesScalarFieldEnum
    having?: opportunitiesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OpportunitiesCountAggregateInputType | true
    _avg?: OpportunitiesAvgAggregateInputType
    _sum?: OpportunitiesSumAggregateInputType
    _min?: OpportunitiesMinAggregateInputType
    _max?: OpportunitiesMaxAggregateInputType
  }

  export type OpportunitiesGroupByOutputType = {
    id: number
    source: string
    state_code: string | null
    source_grant_id: string
    status: $Enums.opportunity_status_enum
    title: string
    description: string | null
    description_summary: string | null
    agency: string | null
    funding_instrument: string | null
    category: string | null
    fiscal_year: number | null
    post_date: Date | null
    close_date: Date | null
    archive_date: Date | null
    cost_sharing: boolean | null
    award_max: number | null
    award_min: number | null
    total_funding_amount: number | null
    eligibility: string | null
    eligibility_summary: string | null
    last_updated: Date | null
    contact_name: string | null
    contact_email: string | null
    contact_phone: string | null
    url: string | null
    attachments: JsonValue | null
    extra: JsonValue | null
    relevance_score: number | null
    _count: OpportunitiesCountAggregateOutputType | null
    _avg: OpportunitiesAvgAggregateOutputType | null
    _sum: OpportunitiesSumAggregateOutputType | null
    _min: OpportunitiesMinAggregateOutputType | null
    _max: OpportunitiesMaxAggregateOutputType | null
  }

  type GetOpportunitiesGroupByPayload<T extends opportunitiesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OpportunitiesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OpportunitiesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OpportunitiesGroupByOutputType[P]>
            : GetScalarType<T[P], OpportunitiesGroupByOutputType[P]>
        }
      >
    >


  export type opportunitiesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    state_code?: boolean
    source_grant_id?: boolean
    status?: boolean
    title?: boolean
    description?: boolean
    description_summary?: boolean
    agency?: boolean
    funding_instrument?: boolean
    category?: boolean
    fiscal_year?: boolean
    post_date?: boolean
    close_date?: boolean
    archive_date?: boolean
    cost_sharing?: boolean
    award_max?: boolean
    award_min?: boolean
    total_funding_amount?: boolean
    eligibility?: boolean
    eligibility_summary?: boolean
    last_updated?: boolean
    contact_name?: boolean
    contact_email?: boolean
    contact_phone?: boolean
    url?: boolean
    attachments?: boolean
    extra?: boolean
    relevance_score?: boolean
  }, ExtArgs["result"]["opportunities"]>

  export type opportunitiesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    state_code?: boolean
    source_grant_id?: boolean
    status?: boolean
    title?: boolean
    description?: boolean
    description_summary?: boolean
    agency?: boolean
    funding_instrument?: boolean
    category?: boolean
    fiscal_year?: boolean
    post_date?: boolean
    close_date?: boolean
    archive_date?: boolean
    cost_sharing?: boolean
    award_max?: boolean
    award_min?: boolean
    total_funding_amount?: boolean
    eligibility?: boolean
    eligibility_summary?: boolean
    last_updated?: boolean
    contact_name?: boolean
    contact_email?: boolean
    contact_phone?: boolean
    url?: boolean
    attachments?: boolean
    extra?: boolean
    relevance_score?: boolean
  }, ExtArgs["result"]["opportunities"]>

  export type opportunitiesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    state_code?: boolean
    source_grant_id?: boolean
    status?: boolean
    title?: boolean
    description?: boolean
    description_summary?: boolean
    agency?: boolean
    funding_instrument?: boolean
    category?: boolean
    fiscal_year?: boolean
    post_date?: boolean
    close_date?: boolean
    archive_date?: boolean
    cost_sharing?: boolean
    award_max?: boolean
    award_min?: boolean
    total_funding_amount?: boolean
    eligibility?: boolean
    eligibility_summary?: boolean
    last_updated?: boolean
    contact_name?: boolean
    contact_email?: boolean
    contact_phone?: boolean
    url?: boolean
    attachments?: boolean
    extra?: boolean
    relevance_score?: boolean
  }, ExtArgs["result"]["opportunities"]>

  export type opportunitiesSelectScalar = {
    id?: boolean
    source?: boolean
    state_code?: boolean
    source_grant_id?: boolean
    status?: boolean
    title?: boolean
    description?: boolean
    description_summary?: boolean
    agency?: boolean
    funding_instrument?: boolean
    category?: boolean
    fiscal_year?: boolean
    post_date?: boolean
    close_date?: boolean
    archive_date?: boolean
    cost_sharing?: boolean
    award_max?: boolean
    award_min?: boolean
    total_funding_amount?: boolean
    eligibility?: boolean
    eligibility_summary?: boolean
    last_updated?: boolean
    contact_name?: boolean
    contact_email?: boolean
    contact_phone?: boolean
    url?: boolean
    attachments?: boolean
    extra?: boolean
    relevance_score?: boolean
  }

  export type opportunitiesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "source" | "state_code" | "source_grant_id" | "status" | "title" | "description" | "description_summary" | "agency" | "funding_instrument" | "category" | "fiscal_year" | "post_date" | "close_date" | "archive_date" | "cost_sharing" | "award_max" | "award_min" | "total_funding_amount" | "eligibility" | "eligibility_summary" | "last_updated" | "contact_name" | "contact_email" | "contact_phone" | "url" | "attachments" | "extra" | "relevance_score", ExtArgs["result"]["opportunities"]>

  export type $opportunitiesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "opportunities"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      source: string
      state_code: string | null
      source_grant_id: string
      status: $Enums.opportunity_status_enum
      title: string
      description: string | null
      description_summary: string | null
      agency: string | null
      funding_instrument: string | null
      category: string | null
      fiscal_year: number | null
      post_date: Date | null
      close_date: Date | null
      archive_date: Date | null
      cost_sharing: boolean | null
      award_max: number | null
      award_min: number | null
      total_funding_amount: number | null
      eligibility: string | null
      eligibility_summary: string | null
      last_updated: Date | null
      contact_name: string | null
      contact_email: string | null
      contact_phone: string | null
      url: string | null
      attachments: Prisma.JsonValue | null
      extra: Prisma.JsonValue | null
      relevance_score: number | null
    }, ExtArgs["result"]["opportunities"]>
    composites: {}
  }

  type opportunitiesGetPayload<S extends boolean | null | undefined | opportunitiesDefaultArgs> = $Result.GetResult<Prisma.$opportunitiesPayload, S>

  type opportunitiesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<opportunitiesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OpportunitiesCountAggregateInputType | true
    }

  export interface opportunitiesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['opportunities'], meta: { name: 'opportunities' } }
    /**
     * Find zero or one Opportunities that matches the filter.
     * @param {opportunitiesFindUniqueArgs} args - Arguments to find a Opportunities
     * @example
     * // Get one Opportunities
     * const opportunities = await prisma.opportunities.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends opportunitiesFindUniqueArgs>(args: SelectSubset<T, opportunitiesFindUniqueArgs<ExtArgs>>): Prisma__opportunitiesClient<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Opportunities that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {opportunitiesFindUniqueOrThrowArgs} args - Arguments to find a Opportunities
     * @example
     * // Get one Opportunities
     * const opportunities = await prisma.opportunities.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends opportunitiesFindUniqueOrThrowArgs>(args: SelectSubset<T, opportunitiesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__opportunitiesClient<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Opportunities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {opportunitiesFindFirstArgs} args - Arguments to find a Opportunities
     * @example
     * // Get one Opportunities
     * const opportunities = await prisma.opportunities.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends opportunitiesFindFirstArgs>(args?: SelectSubset<T, opportunitiesFindFirstArgs<ExtArgs>>): Prisma__opportunitiesClient<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Opportunities that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {opportunitiesFindFirstOrThrowArgs} args - Arguments to find a Opportunities
     * @example
     * // Get one Opportunities
     * const opportunities = await prisma.opportunities.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends opportunitiesFindFirstOrThrowArgs>(args?: SelectSubset<T, opportunitiesFindFirstOrThrowArgs<ExtArgs>>): Prisma__opportunitiesClient<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Opportunities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {opportunitiesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Opportunities
     * const opportunities = await prisma.opportunities.findMany()
     * 
     * // Get first 10 Opportunities
     * const opportunities = await prisma.opportunities.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const opportunitiesWithIdOnly = await prisma.opportunities.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends opportunitiesFindManyArgs>(args?: SelectSubset<T, opportunitiesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Opportunities.
     * @param {opportunitiesCreateArgs} args - Arguments to create a Opportunities.
     * @example
     * // Create one Opportunities
     * const Opportunities = await prisma.opportunities.create({
     *   data: {
     *     // ... data to create a Opportunities
     *   }
     * })
     * 
     */
    create<T extends opportunitiesCreateArgs>(args: SelectSubset<T, opportunitiesCreateArgs<ExtArgs>>): Prisma__opportunitiesClient<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Opportunities.
     * @param {opportunitiesCreateManyArgs} args - Arguments to create many Opportunities.
     * @example
     * // Create many Opportunities
     * const opportunities = await prisma.opportunities.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends opportunitiesCreateManyArgs>(args?: SelectSubset<T, opportunitiesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Opportunities and returns the data saved in the database.
     * @param {opportunitiesCreateManyAndReturnArgs} args - Arguments to create many Opportunities.
     * @example
     * // Create many Opportunities
     * const opportunities = await prisma.opportunities.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Opportunities and only return the `id`
     * const opportunitiesWithIdOnly = await prisma.opportunities.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends opportunitiesCreateManyAndReturnArgs>(args?: SelectSubset<T, opportunitiesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Opportunities.
     * @param {opportunitiesDeleteArgs} args - Arguments to delete one Opportunities.
     * @example
     * // Delete one Opportunities
     * const Opportunities = await prisma.opportunities.delete({
     *   where: {
     *     // ... filter to delete one Opportunities
     *   }
     * })
     * 
     */
    delete<T extends opportunitiesDeleteArgs>(args: SelectSubset<T, opportunitiesDeleteArgs<ExtArgs>>): Prisma__opportunitiesClient<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Opportunities.
     * @param {opportunitiesUpdateArgs} args - Arguments to update one Opportunities.
     * @example
     * // Update one Opportunities
     * const opportunities = await prisma.opportunities.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends opportunitiesUpdateArgs>(args: SelectSubset<T, opportunitiesUpdateArgs<ExtArgs>>): Prisma__opportunitiesClient<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Opportunities.
     * @param {opportunitiesDeleteManyArgs} args - Arguments to filter Opportunities to delete.
     * @example
     * // Delete a few Opportunities
     * const { count } = await prisma.opportunities.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends opportunitiesDeleteManyArgs>(args?: SelectSubset<T, opportunitiesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Opportunities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {opportunitiesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Opportunities
     * const opportunities = await prisma.opportunities.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends opportunitiesUpdateManyArgs>(args: SelectSubset<T, opportunitiesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Opportunities and returns the data updated in the database.
     * @param {opportunitiesUpdateManyAndReturnArgs} args - Arguments to update many Opportunities.
     * @example
     * // Update many Opportunities
     * const opportunities = await prisma.opportunities.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Opportunities and only return the `id`
     * const opportunitiesWithIdOnly = await prisma.opportunities.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends opportunitiesUpdateManyAndReturnArgs>(args: SelectSubset<T, opportunitiesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Opportunities.
     * @param {opportunitiesUpsertArgs} args - Arguments to update or create a Opportunities.
     * @example
     * // Update or create a Opportunities
     * const opportunities = await prisma.opportunities.upsert({
     *   create: {
     *     // ... data to create a Opportunities
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Opportunities we want to update
     *   }
     * })
     */
    upsert<T extends opportunitiesUpsertArgs>(args: SelectSubset<T, opportunitiesUpsertArgs<ExtArgs>>): Prisma__opportunitiesClient<$Result.GetResult<Prisma.$opportunitiesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Opportunities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {opportunitiesCountArgs} args - Arguments to filter Opportunities to count.
     * @example
     * // Count the number of Opportunities
     * const count = await prisma.opportunities.count({
     *   where: {
     *     // ... the filter for the Opportunities we want to count
     *   }
     * })
    **/
    count<T extends opportunitiesCountArgs>(
      args?: Subset<T, opportunitiesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OpportunitiesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Opportunities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OpportunitiesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OpportunitiesAggregateArgs>(args: Subset<T, OpportunitiesAggregateArgs>): Prisma.PrismaPromise<GetOpportunitiesAggregateType<T>>

    /**
     * Group by Opportunities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {opportunitiesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends opportunitiesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: opportunitiesGroupByArgs['orderBy'] }
        : { orderBy?: opportunitiesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, opportunitiesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOpportunitiesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the opportunities model
   */
  readonly fields: opportunitiesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for opportunities.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__opportunitiesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the opportunities model
   */
  interface opportunitiesFieldRefs {
    readonly id: FieldRef<"opportunities", 'Int'>
    readonly source: FieldRef<"opportunities", 'String'>
    readonly state_code: FieldRef<"opportunities", 'String'>
    readonly source_grant_id: FieldRef<"opportunities", 'String'>
    readonly status: FieldRef<"opportunities", 'opportunity_status_enum'>
    readonly title: FieldRef<"opportunities", 'String'>
    readonly description: FieldRef<"opportunities", 'String'>
    readonly description_summary: FieldRef<"opportunities", 'String'>
    readonly agency: FieldRef<"opportunities", 'String'>
    readonly funding_instrument: FieldRef<"opportunities", 'String'>
    readonly category: FieldRef<"opportunities", 'String'>
    readonly fiscal_year: FieldRef<"opportunities", 'Int'>
    readonly post_date: FieldRef<"opportunities", 'DateTime'>
    readonly close_date: FieldRef<"opportunities", 'DateTime'>
    readonly archive_date: FieldRef<"opportunities", 'DateTime'>
    readonly cost_sharing: FieldRef<"opportunities", 'Boolean'>
    readonly award_max: FieldRef<"opportunities", 'Int'>
    readonly award_min: FieldRef<"opportunities", 'Int'>
    readonly total_funding_amount: FieldRef<"opportunities", 'Int'>
    readonly eligibility: FieldRef<"opportunities", 'String'>
    readonly eligibility_summary: FieldRef<"opportunities", 'String'>
    readonly last_updated: FieldRef<"opportunities", 'DateTime'>
    readonly contact_name: FieldRef<"opportunities", 'String'>
    readonly contact_email: FieldRef<"opportunities", 'String'>
    readonly contact_phone: FieldRef<"opportunities", 'String'>
    readonly url: FieldRef<"opportunities", 'String'>
    readonly attachments: FieldRef<"opportunities", 'Json'>
    readonly extra: FieldRef<"opportunities", 'Json'>
    readonly relevance_score: FieldRef<"opportunities", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * opportunities findUnique
   */
  export type opportunitiesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * Filter, which opportunities to fetch.
     */
    where: opportunitiesWhereUniqueInput
  }

  /**
   * opportunities findUniqueOrThrow
   */
  export type opportunitiesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * Filter, which opportunities to fetch.
     */
    where: opportunitiesWhereUniqueInput
  }

  /**
   * opportunities findFirst
   */
  export type opportunitiesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * Filter, which opportunities to fetch.
     */
    where?: opportunitiesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of opportunities to fetch.
     */
    orderBy?: opportunitiesOrderByWithRelationInput | opportunitiesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for opportunities.
     */
    cursor?: opportunitiesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` opportunities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` opportunities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of opportunities.
     */
    distinct?: OpportunitiesScalarFieldEnum | OpportunitiesScalarFieldEnum[]
  }

  /**
   * opportunities findFirstOrThrow
   */
  export type opportunitiesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * Filter, which opportunities to fetch.
     */
    where?: opportunitiesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of opportunities to fetch.
     */
    orderBy?: opportunitiesOrderByWithRelationInput | opportunitiesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for opportunities.
     */
    cursor?: opportunitiesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` opportunities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` opportunities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of opportunities.
     */
    distinct?: OpportunitiesScalarFieldEnum | OpportunitiesScalarFieldEnum[]
  }

  /**
   * opportunities findMany
   */
  export type opportunitiesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * Filter, which opportunities to fetch.
     */
    where?: opportunitiesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of opportunities to fetch.
     */
    orderBy?: opportunitiesOrderByWithRelationInput | opportunitiesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing opportunities.
     */
    cursor?: opportunitiesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` opportunities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` opportunities.
     */
    skip?: number
    distinct?: OpportunitiesScalarFieldEnum | OpportunitiesScalarFieldEnum[]
  }

  /**
   * opportunities create
   */
  export type opportunitiesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * The data needed to create a opportunities.
     */
    data: XOR<opportunitiesCreateInput, opportunitiesUncheckedCreateInput>
  }

  /**
   * opportunities createMany
   */
  export type opportunitiesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many opportunities.
     */
    data: opportunitiesCreateManyInput | opportunitiesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * opportunities createManyAndReturn
   */
  export type opportunitiesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * The data used to create many opportunities.
     */
    data: opportunitiesCreateManyInput | opportunitiesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * opportunities update
   */
  export type opportunitiesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * The data needed to update a opportunities.
     */
    data: XOR<opportunitiesUpdateInput, opportunitiesUncheckedUpdateInput>
    /**
     * Choose, which opportunities to update.
     */
    where: opportunitiesWhereUniqueInput
  }

  /**
   * opportunities updateMany
   */
  export type opportunitiesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update opportunities.
     */
    data: XOR<opportunitiesUpdateManyMutationInput, opportunitiesUncheckedUpdateManyInput>
    /**
     * Filter which opportunities to update
     */
    where?: opportunitiesWhereInput
    /**
     * Limit how many opportunities to update.
     */
    limit?: number
  }

  /**
   * opportunities updateManyAndReturn
   */
  export type opportunitiesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * The data used to update opportunities.
     */
    data: XOR<opportunitiesUpdateManyMutationInput, opportunitiesUncheckedUpdateManyInput>
    /**
     * Filter which opportunities to update
     */
    where?: opportunitiesWhereInput
    /**
     * Limit how many opportunities to update.
     */
    limit?: number
  }

  /**
   * opportunities upsert
   */
  export type opportunitiesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * The filter to search for the opportunities to update in case it exists.
     */
    where: opportunitiesWhereUniqueInput
    /**
     * In case the opportunities found by the `where` argument doesn't exist, create a new opportunities with this data.
     */
    create: XOR<opportunitiesCreateInput, opportunitiesUncheckedCreateInput>
    /**
     * In case the opportunities was found with the provided `where` argument, update it with this data.
     */
    update: XOR<opportunitiesUpdateInput, opportunitiesUncheckedUpdateInput>
  }

  /**
   * opportunities delete
   */
  export type opportunitiesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
    /**
     * Filter which opportunities to delete.
     */
    where: opportunitiesWhereUniqueInput
  }

  /**
   * opportunities deleteMany
   */
  export type opportunitiesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which opportunities to delete
     */
    where?: opportunitiesWhereInput
    /**
     * Limit how many opportunities to delete.
     */
    limit?: number
  }

  /**
   * opportunities without action
   */
  export type opportunitiesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the opportunities
     */
    select?: opportunitiesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the opportunities
     */
    omit?: opportunitiesOmit<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    avatarUrl: string | null
    lastActiveAt: Date | null
    organizationId: string | null
    system_admin: boolean | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    createdAt: Date | null
    updatedAt: Date | null
    avatarUrl: string | null
    lastActiveAt: Date | null
    organizationId: string | null
    system_admin: boolean | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    createdAt: number
    updatedAt: number
    avatarUrl: number
    lastActiveAt: number
    organizationId: number
    system_admin: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    avatarUrl?: true
    lastActiveAt?: true
    organizationId?: true
    system_admin?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    avatarUrl?: true
    lastActiveAt?: true
    organizationId?: true
    system_admin?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    createdAt?: true
    updatedAt?: true
    avatarUrl?: true
    lastActiveAt?: true
    organizationId?: true
    system_admin?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    createdAt: Date
    updatedAt: Date
    avatarUrl: string | null
    lastActiveAt: Date
    organizationId: string
    system_admin: boolean
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    avatarUrl?: boolean
    lastActiveAt?: boolean
    organizationId?: boolean
    system_admin?: boolean
    aiChats?: boolean | User$aiChatsArgs<ExtArgs>
    grantBookmarks?: boolean | User$grantBookmarksArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    avatarUrl?: boolean
    lastActiveAt?: boolean
    organizationId?: boolean
    system_admin?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    avatarUrl?: boolean
    lastActiveAt?: boolean
    organizationId?: boolean
    system_admin?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    avatarUrl?: boolean
    lastActiveAt?: boolean
    organizationId?: boolean
    system_admin?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "createdAt" | "updatedAt" | "avatarUrl" | "lastActiveAt" | "organizationId" | "system_admin", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    aiChats?: boolean | User$aiChatsArgs<ExtArgs>
    grantBookmarks?: boolean | User$grantBookmarksArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      aiChats: Prisma.$AiChatPayload<ExtArgs>[]
      grantBookmarks: Prisma.$GrantBookmarkPayload<ExtArgs>[]
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      createdAt: Date
      updatedAt: Date
      avatarUrl: string | null
      lastActiveAt: Date
      organizationId: string
      system_admin: boolean
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    aiChats<T extends User$aiChatsArgs<ExtArgs> = {}>(args?: Subset<T, User$aiChatsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    grantBookmarks<T extends User$grantBookmarksArgs<ExtArgs> = {}>(args?: Subset<T, User$grantBookmarksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly avatarUrl: FieldRef<"User", 'String'>
    readonly lastActiveAt: FieldRef<"User", 'DateTime'>
    readonly organizationId: FieldRef<"User", 'String'>
    readonly system_admin: FieldRef<"User", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.aiChats
   */
  export type User$aiChatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    where?: AiChatWhereInput
    orderBy?: AiChatOrderByWithRelationInput | AiChatOrderByWithRelationInput[]
    cursor?: AiChatWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AiChatScalarFieldEnum | AiChatScalarFieldEnum[]
  }

  /**
   * User.grantBookmarks
   */
  export type User$grantBookmarksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    where?: GrantBookmarkWhereInput
    orderBy?: GrantBookmarkOrderByWithRelationInput | GrantBookmarkOrderByWithRelationInput[]
    cursor?: GrantBookmarkWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GrantBookmarkScalarFieldEnum | GrantBookmarkScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Organization
   */

  export type AggregateOrganization = {
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  export type OrganizationMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    type: $Enums.OrganizationType | null
    role: $Enums.OrganizationRole | null
    createdAt: Date | null
    updatedAt: Date | null
    schoolDistrictId: string | null
  }

  export type OrganizationMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    type: $Enums.OrganizationType | null
    role: $Enums.OrganizationRole | null
    createdAt: Date | null
    updatedAt: Date | null
    schoolDistrictId: string | null
  }

  export type OrganizationCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    type: number
    role: number
    createdAt: number
    updatedAt: number
    schoolDistrictId: number
    _all: number
  }


  export type OrganizationMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    type?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    schoolDistrictId?: true
  }

  export type OrganizationMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    type?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    schoolDistrictId?: true
  }

  export type OrganizationCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    type?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    schoolDistrictId?: true
    _all?: true
  }

  export type OrganizationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organization to aggregate.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Organizations
    **/
    _count?: true | OrganizationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationMaxAggregateInputType
  }

  export type GetOrganizationAggregateType<T extends OrganizationAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganization]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganization[P]>
      : GetScalarType<T[P], AggregateOrganization[P]>
  }




  export type OrganizationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationWhereInput
    orderBy?: OrganizationOrderByWithAggregationInput | OrganizationOrderByWithAggregationInput[]
    by: OrganizationScalarFieldEnum[] | OrganizationScalarFieldEnum
    having?: OrganizationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationCountAggregateInputType | true
    _min?: OrganizationMinAggregateInputType
    _max?: OrganizationMaxAggregateInputType
  }

  export type OrganizationGroupByOutputType = {
    id: string
    name: string
    slug: string
    type: $Enums.OrganizationType
    role: $Enums.OrganizationRole
    createdAt: Date
    updatedAt: Date
    schoolDistrictId: string | null
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  type GetOrganizationGroupByPayload<T extends OrganizationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    type?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schoolDistrictId?: boolean
    aiChats?: boolean | Organization$aiChatsArgs<ExtArgs>
    applications?: boolean | Organization$applicationsArgs<ExtArgs>
    grantBookmarks?: boolean | Organization$grantBookmarksArgs<ExtArgs>
    eligibilityAnalyses?: boolean | Organization$eligibilityAnalysesArgs<ExtArgs>
    user?: boolean | Organization$userArgs<ExtArgs>
    schoolDistrict?: boolean | Organization$schoolDistrictArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    type?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schoolDistrictId?: boolean
    schoolDistrict?: boolean | Organization$schoolDistrictArgs<ExtArgs>
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    type?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schoolDistrictId?: boolean
    schoolDistrict?: boolean | Organization$schoolDistrictArgs<ExtArgs>
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    type?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schoolDistrictId?: boolean
  }

  export type OrganizationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "type" | "role" | "createdAt" | "updatedAt" | "schoolDistrictId", ExtArgs["result"]["organization"]>
  export type OrganizationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    aiChats?: boolean | Organization$aiChatsArgs<ExtArgs>
    applications?: boolean | Organization$applicationsArgs<ExtArgs>
    grantBookmarks?: boolean | Organization$grantBookmarksArgs<ExtArgs>
    eligibilityAnalyses?: boolean | Organization$eligibilityAnalysesArgs<ExtArgs>
    user?: boolean | Organization$userArgs<ExtArgs>
    schoolDistrict?: boolean | Organization$schoolDistrictArgs<ExtArgs>
    _count?: boolean | OrganizationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrganizationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schoolDistrict?: boolean | Organization$schoolDistrictArgs<ExtArgs>
  }
  export type OrganizationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    schoolDistrict?: boolean | Organization$schoolDistrictArgs<ExtArgs>
  }

  export type $OrganizationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Organization"
    objects: {
      aiChats: Prisma.$AiChatPayload<ExtArgs>[]
      applications: Prisma.$ApplicationPayload<ExtArgs>[]
      grantBookmarks: Prisma.$GrantBookmarkPayload<ExtArgs>[]
      eligibilityAnalyses: Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>[]
      user: Prisma.$UserPayload<ExtArgs> | null
      schoolDistrict: Prisma.$SchoolDistrictPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      type: $Enums.OrganizationType
      role: $Enums.OrganizationRole
      createdAt: Date
      updatedAt: Date
      schoolDistrictId: string | null
    }, ExtArgs["result"]["organization"]>
    composites: {}
  }

  type OrganizationGetPayload<S extends boolean | null | undefined | OrganizationDefaultArgs> = $Result.GetResult<Prisma.$OrganizationPayload, S>

  type OrganizationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationCountAggregateInputType | true
    }

  export interface OrganizationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Organization'], meta: { name: 'Organization' } }
    /**
     * Find zero or one Organization that matches the filter.
     * @param {OrganizationFindUniqueArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationFindUniqueArgs>(args: SelectSubset<T, OrganizationFindUniqueArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organization that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationFindUniqueOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationFindFirstArgs>(args?: SelectSubset<T, OrganizationFindFirstArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organizations
     * const organizations = await prisma.organization.findMany()
     * 
     * // Get first 10 Organizations
     * const organizations = await prisma.organization.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationWithIdOnly = await prisma.organization.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationFindManyArgs>(args?: SelectSubset<T, OrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organization.
     * @param {OrganizationCreateArgs} args - Arguments to create a Organization.
     * @example
     * // Create one Organization
     * const Organization = await prisma.organization.create({
     *   data: {
     *     // ... data to create a Organization
     *   }
     * })
     * 
     */
    create<T extends OrganizationCreateArgs>(args: SelectSubset<T, OrganizationCreateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organizations.
     * @param {OrganizationCreateManyArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationCreateManyArgs>(args?: SelectSubset<T, OrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Organizations and returns the data saved in the database.
     * @param {OrganizationCreateManyAndReturnArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganizationCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Organization.
     * @param {OrganizationDeleteArgs} args - Arguments to delete one Organization.
     * @example
     * // Delete one Organization
     * const Organization = await prisma.organization.delete({
     *   where: {
     *     // ... filter to delete one Organization
     *   }
     * })
     * 
     */
    delete<T extends OrganizationDeleteArgs>(args: SelectSubset<T, OrganizationDeleteArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organization.
     * @param {OrganizationUpdateArgs} args - Arguments to update one Organization.
     * @example
     * // Update one Organization
     * const organization = await prisma.organization.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationUpdateArgs>(args: SelectSubset<T, OrganizationUpdateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organizations.
     * @param {OrganizationDeleteManyArgs} args - Arguments to filter Organizations to delete.
     * @example
     * // Delete a few Organizations
     * const { count } = await prisma.organization.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationDeleteManyArgs>(args?: SelectSubset<T, OrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationUpdateManyArgs>(args: SelectSubset<T, OrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations and returns the data updated in the database.
     * @param {OrganizationUpdateManyAndReturnArgs} args - Arguments to update many Organizations.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrganizationUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Organization.
     * @param {OrganizationUpsertArgs} args - Arguments to update or create a Organization.
     * @example
     * // Update or create a Organization
     * const organization = await prisma.organization.upsert({
     *   create: {
     *     // ... data to create a Organization
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organization we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationUpsertArgs>(args: SelectSubset<T, OrganizationUpsertArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationCountArgs} args - Arguments to filter Organizations to count.
     * @example
     * // Count the number of Organizations
     * const count = await prisma.organization.count({
     *   where: {
     *     // ... the filter for the Organizations we want to count
     *   }
     * })
    **/
    count<T extends OrganizationCountArgs>(
      args?: Subset<T, OrganizationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrganizationAggregateArgs>(args: Subset<T, OrganizationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationAggregateType<T>>

    /**
     * Group by Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrganizationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Organization model
   */
  readonly fields: OrganizationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Organization.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    aiChats<T extends Organization$aiChatsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$aiChatsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    applications<T extends Organization$applicationsArgs<ExtArgs> = {}>(args?: Subset<T, Organization$applicationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    grantBookmarks<T extends Organization$grantBookmarksArgs<ExtArgs> = {}>(args?: Subset<T, Organization$grantBookmarksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    eligibilityAnalyses<T extends Organization$eligibilityAnalysesArgs<ExtArgs> = {}>(args?: Subset<T, Organization$eligibilityAnalysesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    user<T extends Organization$userArgs<ExtArgs> = {}>(args?: Subset<T, Organization$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    schoolDistrict<T extends Organization$schoolDistrictArgs<ExtArgs> = {}>(args?: Subset<T, Organization$schoolDistrictArgs<ExtArgs>>): Prisma__SchoolDistrictClient<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Organization model
   */
  interface OrganizationFieldRefs {
    readonly id: FieldRef<"Organization", 'String'>
    readonly name: FieldRef<"Organization", 'String'>
    readonly slug: FieldRef<"Organization", 'String'>
    readonly type: FieldRef<"Organization", 'OrganizationType'>
    readonly role: FieldRef<"Organization", 'OrganizationRole'>
    readonly createdAt: FieldRef<"Organization", 'DateTime'>
    readonly updatedAt: FieldRef<"Organization", 'DateTime'>
    readonly schoolDistrictId: FieldRef<"Organization", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Organization findUnique
   */
  export type OrganizationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findUniqueOrThrow
   */
  export type OrganizationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findFirst
   */
  export type OrganizationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findFirstOrThrow
   */
  export type OrganizationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findMany
   */
  export type OrganizationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter, which Organizations to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization create
   */
  export type OrganizationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to create a Organization.
     */
    data: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
  }

  /**
   * Organization createMany
   */
  export type OrganizationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization createManyAndReturn
   */
  export type OrganizationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Organization update
   */
  export type OrganizationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The data needed to update a Organization.
     */
    data: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
    /**
     * Choose, which Organization to update.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization updateMany
   */
  export type OrganizationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization updateManyAndReturn
   */
  export type OrganizationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Organization upsert
   */
  export type OrganizationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * The filter to search for the Organization to update in case it exists.
     */
    where: OrganizationWhereUniqueInput
    /**
     * In case the Organization found by the `where` argument doesn't exist, create a new Organization with this data.
     */
    create: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
    /**
     * In case the Organization was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
  }

  /**
   * Organization delete
   */
  export type OrganizationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    /**
     * Filter which Organization to delete.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization deleteMany
   */
  export type OrganizationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organizations to delete
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to delete.
     */
    limit?: number
  }

  /**
   * Organization.aiChats
   */
  export type Organization$aiChatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    where?: AiChatWhereInput
    orderBy?: AiChatOrderByWithRelationInput | AiChatOrderByWithRelationInput[]
    cursor?: AiChatWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AiChatScalarFieldEnum | AiChatScalarFieldEnum[]
  }

  /**
   * Organization.applications
   */
  export type Organization$applicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    where?: ApplicationWhereInput
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    cursor?: ApplicationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Organization.grantBookmarks
   */
  export type Organization$grantBookmarksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    where?: GrantBookmarkWhereInput
    orderBy?: GrantBookmarkOrderByWithRelationInput | GrantBookmarkOrderByWithRelationInput[]
    cursor?: GrantBookmarkWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GrantBookmarkScalarFieldEnum | GrantBookmarkScalarFieldEnum[]
  }

  /**
   * Organization.eligibilityAnalyses
   */
  export type Organization$eligibilityAnalysesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    where?: GrantEligibilityAnalysisWhereInput
    orderBy?: GrantEligibilityAnalysisOrderByWithRelationInput | GrantEligibilityAnalysisOrderByWithRelationInput[]
    cursor?: GrantEligibilityAnalysisWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GrantEligibilityAnalysisScalarFieldEnum | GrantEligibilityAnalysisScalarFieldEnum[]
  }

  /**
   * Organization.user
   */
  export type Organization$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Organization.schoolDistrict
   */
  export type Organization$schoolDistrictArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    where?: SchoolDistrictWhereInput
  }

  /**
   * Organization without action
   */
  export type OrganizationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
  }


  /**
   * Model SchoolDistrict
   */

  export type AggregateSchoolDistrict = {
    _count: SchoolDistrictCountAggregateOutputType | null
    _avg: SchoolDistrictAvgAggregateOutputType | null
    _sum: SchoolDistrictSumAggregateOutputType | null
    _min: SchoolDistrictMinAggregateOutputType | null
    _max: SchoolDistrictMaxAggregateOutputType | null
  }

  export type SchoolDistrictAvgAggregateOutputType = {
    latitude: number | null
    longitude: number | null
    enrollment: number | null
    numberOfSchools: number | null
    lowestGrade: number | null
    highestGrade: number | null
    urbanCentricLocale: number | null
    year: number | null
  }

  export type SchoolDistrictSumAggregateOutputType = {
    latitude: number | null
    longitude: number | null
    enrollment: number | null
    numberOfSchools: number | null
    lowestGrade: number | null
    highestGrade: number | null
    urbanCentricLocale: number | null
    year: number | null
  }

  export type SchoolDistrictMinAggregateOutputType = {
    id: string | null
    leaId: string | null
    name: string | null
    stateCode: string | null
    stateLeaId: string | null
    city: string | null
    zipCode: string | null
    phone: string | null
    latitude: number | null
    longitude: number | null
    countyName: string | null
    enrollment: number | null
    numberOfSchools: number | null
    lowestGrade: number | null
    highestGrade: number | null
    urbanCentricLocale: number | null
    year: number | null
  }

  export type SchoolDistrictMaxAggregateOutputType = {
    id: string | null
    leaId: string | null
    name: string | null
    stateCode: string | null
    stateLeaId: string | null
    city: string | null
    zipCode: string | null
    phone: string | null
    latitude: number | null
    longitude: number | null
    countyName: string | null
    enrollment: number | null
    numberOfSchools: number | null
    lowestGrade: number | null
    highestGrade: number | null
    urbanCentricLocale: number | null
    year: number | null
  }

  export type SchoolDistrictCountAggregateOutputType = {
    id: number
    leaId: number
    name: number
    stateCode: number
    stateLeaId: number
    city: number
    zipCode: number
    phone: number
    latitude: number
    longitude: number
    countyName: number
    enrollment: number
    numberOfSchools: number
    lowestGrade: number
    highestGrade: number
    urbanCentricLocale: number
    year: number
    _all: number
  }


  export type SchoolDistrictAvgAggregateInputType = {
    latitude?: true
    longitude?: true
    enrollment?: true
    numberOfSchools?: true
    lowestGrade?: true
    highestGrade?: true
    urbanCentricLocale?: true
    year?: true
  }

  export type SchoolDistrictSumAggregateInputType = {
    latitude?: true
    longitude?: true
    enrollment?: true
    numberOfSchools?: true
    lowestGrade?: true
    highestGrade?: true
    urbanCentricLocale?: true
    year?: true
  }

  export type SchoolDistrictMinAggregateInputType = {
    id?: true
    leaId?: true
    name?: true
    stateCode?: true
    stateLeaId?: true
    city?: true
    zipCode?: true
    phone?: true
    latitude?: true
    longitude?: true
    countyName?: true
    enrollment?: true
    numberOfSchools?: true
    lowestGrade?: true
    highestGrade?: true
    urbanCentricLocale?: true
    year?: true
  }

  export type SchoolDistrictMaxAggregateInputType = {
    id?: true
    leaId?: true
    name?: true
    stateCode?: true
    stateLeaId?: true
    city?: true
    zipCode?: true
    phone?: true
    latitude?: true
    longitude?: true
    countyName?: true
    enrollment?: true
    numberOfSchools?: true
    lowestGrade?: true
    highestGrade?: true
    urbanCentricLocale?: true
    year?: true
  }

  export type SchoolDistrictCountAggregateInputType = {
    id?: true
    leaId?: true
    name?: true
    stateCode?: true
    stateLeaId?: true
    city?: true
    zipCode?: true
    phone?: true
    latitude?: true
    longitude?: true
    countyName?: true
    enrollment?: true
    numberOfSchools?: true
    lowestGrade?: true
    highestGrade?: true
    urbanCentricLocale?: true
    year?: true
    _all?: true
  }

  export type SchoolDistrictAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SchoolDistrict to aggregate.
     */
    where?: SchoolDistrictWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SchoolDistricts to fetch.
     */
    orderBy?: SchoolDistrictOrderByWithRelationInput | SchoolDistrictOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SchoolDistrictWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SchoolDistricts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SchoolDistricts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SchoolDistricts
    **/
    _count?: true | SchoolDistrictCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SchoolDistrictAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SchoolDistrictSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SchoolDistrictMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SchoolDistrictMaxAggregateInputType
  }

  export type GetSchoolDistrictAggregateType<T extends SchoolDistrictAggregateArgs> = {
        [P in keyof T & keyof AggregateSchoolDistrict]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSchoolDistrict[P]>
      : GetScalarType<T[P], AggregateSchoolDistrict[P]>
  }




  export type SchoolDistrictGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SchoolDistrictWhereInput
    orderBy?: SchoolDistrictOrderByWithAggregationInput | SchoolDistrictOrderByWithAggregationInput[]
    by: SchoolDistrictScalarFieldEnum[] | SchoolDistrictScalarFieldEnum
    having?: SchoolDistrictScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SchoolDistrictCountAggregateInputType | true
    _avg?: SchoolDistrictAvgAggregateInputType
    _sum?: SchoolDistrictSumAggregateInputType
    _min?: SchoolDistrictMinAggregateInputType
    _max?: SchoolDistrictMaxAggregateInputType
  }

  export type SchoolDistrictGroupByOutputType = {
    id: string
    leaId: string
    name: string
    stateCode: string
    stateLeaId: string | null
    city: string | null
    zipCode: string | null
    phone: string | null
    latitude: number | null
    longitude: number | null
    countyName: string | null
    enrollment: number | null
    numberOfSchools: number | null
    lowestGrade: number | null
    highestGrade: number | null
    urbanCentricLocale: number | null
    year: number
    _count: SchoolDistrictCountAggregateOutputType | null
    _avg: SchoolDistrictAvgAggregateOutputType | null
    _sum: SchoolDistrictSumAggregateOutputType | null
    _min: SchoolDistrictMinAggregateOutputType | null
    _max: SchoolDistrictMaxAggregateOutputType | null
  }

  type GetSchoolDistrictGroupByPayload<T extends SchoolDistrictGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SchoolDistrictGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SchoolDistrictGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SchoolDistrictGroupByOutputType[P]>
            : GetScalarType<T[P], SchoolDistrictGroupByOutputType[P]>
        }
      >
    >


  export type SchoolDistrictSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leaId?: boolean
    name?: boolean
    stateCode?: boolean
    stateLeaId?: boolean
    city?: boolean
    zipCode?: boolean
    phone?: boolean
    latitude?: boolean
    longitude?: boolean
    countyName?: boolean
    enrollment?: boolean
    numberOfSchools?: boolean
    lowestGrade?: boolean
    highestGrade?: boolean
    urbanCentricLocale?: boolean
    year?: boolean
    organizations?: boolean | SchoolDistrict$organizationsArgs<ExtArgs>
    _count?: boolean | SchoolDistrictCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["schoolDistrict"]>

  export type SchoolDistrictSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leaId?: boolean
    name?: boolean
    stateCode?: boolean
    stateLeaId?: boolean
    city?: boolean
    zipCode?: boolean
    phone?: boolean
    latitude?: boolean
    longitude?: boolean
    countyName?: boolean
    enrollment?: boolean
    numberOfSchools?: boolean
    lowestGrade?: boolean
    highestGrade?: boolean
    urbanCentricLocale?: boolean
    year?: boolean
  }, ExtArgs["result"]["schoolDistrict"]>

  export type SchoolDistrictSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leaId?: boolean
    name?: boolean
    stateCode?: boolean
    stateLeaId?: boolean
    city?: boolean
    zipCode?: boolean
    phone?: boolean
    latitude?: boolean
    longitude?: boolean
    countyName?: boolean
    enrollment?: boolean
    numberOfSchools?: boolean
    lowestGrade?: boolean
    highestGrade?: boolean
    urbanCentricLocale?: boolean
    year?: boolean
  }, ExtArgs["result"]["schoolDistrict"]>

  export type SchoolDistrictSelectScalar = {
    id?: boolean
    leaId?: boolean
    name?: boolean
    stateCode?: boolean
    stateLeaId?: boolean
    city?: boolean
    zipCode?: boolean
    phone?: boolean
    latitude?: boolean
    longitude?: boolean
    countyName?: boolean
    enrollment?: boolean
    numberOfSchools?: boolean
    lowestGrade?: boolean
    highestGrade?: boolean
    urbanCentricLocale?: boolean
    year?: boolean
  }

  export type SchoolDistrictOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "leaId" | "name" | "stateCode" | "stateLeaId" | "city" | "zipCode" | "phone" | "latitude" | "longitude" | "countyName" | "enrollment" | "numberOfSchools" | "lowestGrade" | "highestGrade" | "urbanCentricLocale" | "year", ExtArgs["result"]["schoolDistrict"]>
  export type SchoolDistrictInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organizations?: boolean | SchoolDistrict$organizationsArgs<ExtArgs>
    _count?: boolean | SchoolDistrictCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SchoolDistrictIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SchoolDistrictIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SchoolDistrictPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SchoolDistrict"
    objects: {
      organizations: Prisma.$OrganizationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      leaId: string
      name: string
      stateCode: string
      stateLeaId: string | null
      city: string | null
      zipCode: string | null
      phone: string | null
      latitude: number | null
      longitude: number | null
      countyName: string | null
      enrollment: number | null
      numberOfSchools: number | null
      lowestGrade: number | null
      highestGrade: number | null
      urbanCentricLocale: number | null
      year: number
    }, ExtArgs["result"]["schoolDistrict"]>
    composites: {}
  }

  type SchoolDistrictGetPayload<S extends boolean | null | undefined | SchoolDistrictDefaultArgs> = $Result.GetResult<Prisma.$SchoolDistrictPayload, S>

  type SchoolDistrictCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SchoolDistrictFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SchoolDistrictCountAggregateInputType | true
    }

  export interface SchoolDistrictDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SchoolDistrict'], meta: { name: 'SchoolDistrict' } }
    /**
     * Find zero or one SchoolDistrict that matches the filter.
     * @param {SchoolDistrictFindUniqueArgs} args - Arguments to find a SchoolDistrict
     * @example
     * // Get one SchoolDistrict
     * const schoolDistrict = await prisma.schoolDistrict.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SchoolDistrictFindUniqueArgs>(args: SelectSubset<T, SchoolDistrictFindUniqueArgs<ExtArgs>>): Prisma__SchoolDistrictClient<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SchoolDistrict that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SchoolDistrictFindUniqueOrThrowArgs} args - Arguments to find a SchoolDistrict
     * @example
     * // Get one SchoolDistrict
     * const schoolDistrict = await prisma.schoolDistrict.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SchoolDistrictFindUniqueOrThrowArgs>(args: SelectSubset<T, SchoolDistrictFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SchoolDistrictClient<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SchoolDistrict that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolDistrictFindFirstArgs} args - Arguments to find a SchoolDistrict
     * @example
     * // Get one SchoolDistrict
     * const schoolDistrict = await prisma.schoolDistrict.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SchoolDistrictFindFirstArgs>(args?: SelectSubset<T, SchoolDistrictFindFirstArgs<ExtArgs>>): Prisma__SchoolDistrictClient<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SchoolDistrict that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolDistrictFindFirstOrThrowArgs} args - Arguments to find a SchoolDistrict
     * @example
     * // Get one SchoolDistrict
     * const schoolDistrict = await prisma.schoolDistrict.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SchoolDistrictFindFirstOrThrowArgs>(args?: SelectSubset<T, SchoolDistrictFindFirstOrThrowArgs<ExtArgs>>): Prisma__SchoolDistrictClient<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SchoolDistricts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolDistrictFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SchoolDistricts
     * const schoolDistricts = await prisma.schoolDistrict.findMany()
     * 
     * // Get first 10 SchoolDistricts
     * const schoolDistricts = await prisma.schoolDistrict.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const schoolDistrictWithIdOnly = await prisma.schoolDistrict.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SchoolDistrictFindManyArgs>(args?: SelectSubset<T, SchoolDistrictFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SchoolDistrict.
     * @param {SchoolDistrictCreateArgs} args - Arguments to create a SchoolDistrict.
     * @example
     * // Create one SchoolDistrict
     * const SchoolDistrict = await prisma.schoolDistrict.create({
     *   data: {
     *     // ... data to create a SchoolDistrict
     *   }
     * })
     * 
     */
    create<T extends SchoolDistrictCreateArgs>(args: SelectSubset<T, SchoolDistrictCreateArgs<ExtArgs>>): Prisma__SchoolDistrictClient<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SchoolDistricts.
     * @param {SchoolDistrictCreateManyArgs} args - Arguments to create many SchoolDistricts.
     * @example
     * // Create many SchoolDistricts
     * const schoolDistrict = await prisma.schoolDistrict.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SchoolDistrictCreateManyArgs>(args?: SelectSubset<T, SchoolDistrictCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SchoolDistricts and returns the data saved in the database.
     * @param {SchoolDistrictCreateManyAndReturnArgs} args - Arguments to create many SchoolDistricts.
     * @example
     * // Create many SchoolDistricts
     * const schoolDistrict = await prisma.schoolDistrict.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SchoolDistricts and only return the `id`
     * const schoolDistrictWithIdOnly = await prisma.schoolDistrict.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SchoolDistrictCreateManyAndReturnArgs>(args?: SelectSubset<T, SchoolDistrictCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SchoolDistrict.
     * @param {SchoolDistrictDeleteArgs} args - Arguments to delete one SchoolDistrict.
     * @example
     * // Delete one SchoolDistrict
     * const SchoolDistrict = await prisma.schoolDistrict.delete({
     *   where: {
     *     // ... filter to delete one SchoolDistrict
     *   }
     * })
     * 
     */
    delete<T extends SchoolDistrictDeleteArgs>(args: SelectSubset<T, SchoolDistrictDeleteArgs<ExtArgs>>): Prisma__SchoolDistrictClient<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SchoolDistrict.
     * @param {SchoolDistrictUpdateArgs} args - Arguments to update one SchoolDistrict.
     * @example
     * // Update one SchoolDistrict
     * const schoolDistrict = await prisma.schoolDistrict.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SchoolDistrictUpdateArgs>(args: SelectSubset<T, SchoolDistrictUpdateArgs<ExtArgs>>): Prisma__SchoolDistrictClient<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SchoolDistricts.
     * @param {SchoolDistrictDeleteManyArgs} args - Arguments to filter SchoolDistricts to delete.
     * @example
     * // Delete a few SchoolDistricts
     * const { count } = await prisma.schoolDistrict.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SchoolDistrictDeleteManyArgs>(args?: SelectSubset<T, SchoolDistrictDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SchoolDistricts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolDistrictUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SchoolDistricts
     * const schoolDistrict = await prisma.schoolDistrict.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SchoolDistrictUpdateManyArgs>(args: SelectSubset<T, SchoolDistrictUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SchoolDistricts and returns the data updated in the database.
     * @param {SchoolDistrictUpdateManyAndReturnArgs} args - Arguments to update many SchoolDistricts.
     * @example
     * // Update many SchoolDistricts
     * const schoolDistrict = await prisma.schoolDistrict.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SchoolDistricts and only return the `id`
     * const schoolDistrictWithIdOnly = await prisma.schoolDistrict.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SchoolDistrictUpdateManyAndReturnArgs>(args: SelectSubset<T, SchoolDistrictUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SchoolDistrict.
     * @param {SchoolDistrictUpsertArgs} args - Arguments to update or create a SchoolDistrict.
     * @example
     * // Update or create a SchoolDistrict
     * const schoolDistrict = await prisma.schoolDistrict.upsert({
     *   create: {
     *     // ... data to create a SchoolDistrict
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SchoolDistrict we want to update
     *   }
     * })
     */
    upsert<T extends SchoolDistrictUpsertArgs>(args: SelectSubset<T, SchoolDistrictUpsertArgs<ExtArgs>>): Prisma__SchoolDistrictClient<$Result.GetResult<Prisma.$SchoolDistrictPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SchoolDistricts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolDistrictCountArgs} args - Arguments to filter SchoolDistricts to count.
     * @example
     * // Count the number of SchoolDistricts
     * const count = await prisma.schoolDistrict.count({
     *   where: {
     *     // ... the filter for the SchoolDistricts we want to count
     *   }
     * })
    **/
    count<T extends SchoolDistrictCountArgs>(
      args?: Subset<T, SchoolDistrictCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SchoolDistrictCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SchoolDistrict.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolDistrictAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SchoolDistrictAggregateArgs>(args: Subset<T, SchoolDistrictAggregateArgs>): Prisma.PrismaPromise<GetSchoolDistrictAggregateType<T>>

    /**
     * Group by SchoolDistrict.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolDistrictGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SchoolDistrictGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SchoolDistrictGroupByArgs['orderBy'] }
        : { orderBy?: SchoolDistrictGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SchoolDistrictGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSchoolDistrictGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SchoolDistrict model
   */
  readonly fields: SchoolDistrictFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SchoolDistrict.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SchoolDistrictClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organizations<T extends SchoolDistrict$organizationsArgs<ExtArgs> = {}>(args?: Subset<T, SchoolDistrict$organizationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SchoolDistrict model
   */
  interface SchoolDistrictFieldRefs {
    readonly id: FieldRef<"SchoolDistrict", 'String'>
    readonly leaId: FieldRef<"SchoolDistrict", 'String'>
    readonly name: FieldRef<"SchoolDistrict", 'String'>
    readonly stateCode: FieldRef<"SchoolDistrict", 'String'>
    readonly stateLeaId: FieldRef<"SchoolDistrict", 'String'>
    readonly city: FieldRef<"SchoolDistrict", 'String'>
    readonly zipCode: FieldRef<"SchoolDistrict", 'String'>
    readonly phone: FieldRef<"SchoolDistrict", 'String'>
    readonly latitude: FieldRef<"SchoolDistrict", 'Float'>
    readonly longitude: FieldRef<"SchoolDistrict", 'Float'>
    readonly countyName: FieldRef<"SchoolDistrict", 'String'>
    readonly enrollment: FieldRef<"SchoolDistrict", 'Int'>
    readonly numberOfSchools: FieldRef<"SchoolDistrict", 'Int'>
    readonly lowestGrade: FieldRef<"SchoolDistrict", 'Int'>
    readonly highestGrade: FieldRef<"SchoolDistrict", 'Int'>
    readonly urbanCentricLocale: FieldRef<"SchoolDistrict", 'Int'>
    readonly year: FieldRef<"SchoolDistrict", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * SchoolDistrict findUnique
   */
  export type SchoolDistrictFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    /**
     * Filter, which SchoolDistrict to fetch.
     */
    where: SchoolDistrictWhereUniqueInput
  }

  /**
   * SchoolDistrict findUniqueOrThrow
   */
  export type SchoolDistrictFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    /**
     * Filter, which SchoolDistrict to fetch.
     */
    where: SchoolDistrictWhereUniqueInput
  }

  /**
   * SchoolDistrict findFirst
   */
  export type SchoolDistrictFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    /**
     * Filter, which SchoolDistrict to fetch.
     */
    where?: SchoolDistrictWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SchoolDistricts to fetch.
     */
    orderBy?: SchoolDistrictOrderByWithRelationInput | SchoolDistrictOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SchoolDistricts.
     */
    cursor?: SchoolDistrictWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SchoolDistricts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SchoolDistricts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SchoolDistricts.
     */
    distinct?: SchoolDistrictScalarFieldEnum | SchoolDistrictScalarFieldEnum[]
  }

  /**
   * SchoolDistrict findFirstOrThrow
   */
  export type SchoolDistrictFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    /**
     * Filter, which SchoolDistrict to fetch.
     */
    where?: SchoolDistrictWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SchoolDistricts to fetch.
     */
    orderBy?: SchoolDistrictOrderByWithRelationInput | SchoolDistrictOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SchoolDistricts.
     */
    cursor?: SchoolDistrictWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SchoolDistricts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SchoolDistricts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SchoolDistricts.
     */
    distinct?: SchoolDistrictScalarFieldEnum | SchoolDistrictScalarFieldEnum[]
  }

  /**
   * SchoolDistrict findMany
   */
  export type SchoolDistrictFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    /**
     * Filter, which SchoolDistricts to fetch.
     */
    where?: SchoolDistrictWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SchoolDistricts to fetch.
     */
    orderBy?: SchoolDistrictOrderByWithRelationInput | SchoolDistrictOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SchoolDistricts.
     */
    cursor?: SchoolDistrictWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SchoolDistricts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SchoolDistricts.
     */
    skip?: number
    distinct?: SchoolDistrictScalarFieldEnum | SchoolDistrictScalarFieldEnum[]
  }

  /**
   * SchoolDistrict create
   */
  export type SchoolDistrictCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    /**
     * The data needed to create a SchoolDistrict.
     */
    data: XOR<SchoolDistrictCreateInput, SchoolDistrictUncheckedCreateInput>
  }

  /**
   * SchoolDistrict createMany
   */
  export type SchoolDistrictCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SchoolDistricts.
     */
    data: SchoolDistrictCreateManyInput | SchoolDistrictCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SchoolDistrict createManyAndReturn
   */
  export type SchoolDistrictCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * The data used to create many SchoolDistricts.
     */
    data: SchoolDistrictCreateManyInput | SchoolDistrictCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SchoolDistrict update
   */
  export type SchoolDistrictUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    /**
     * The data needed to update a SchoolDistrict.
     */
    data: XOR<SchoolDistrictUpdateInput, SchoolDistrictUncheckedUpdateInput>
    /**
     * Choose, which SchoolDistrict to update.
     */
    where: SchoolDistrictWhereUniqueInput
  }

  /**
   * SchoolDistrict updateMany
   */
  export type SchoolDistrictUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SchoolDistricts.
     */
    data: XOR<SchoolDistrictUpdateManyMutationInput, SchoolDistrictUncheckedUpdateManyInput>
    /**
     * Filter which SchoolDistricts to update
     */
    where?: SchoolDistrictWhereInput
    /**
     * Limit how many SchoolDistricts to update.
     */
    limit?: number
  }

  /**
   * SchoolDistrict updateManyAndReturn
   */
  export type SchoolDistrictUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * The data used to update SchoolDistricts.
     */
    data: XOR<SchoolDistrictUpdateManyMutationInput, SchoolDistrictUncheckedUpdateManyInput>
    /**
     * Filter which SchoolDistricts to update
     */
    where?: SchoolDistrictWhereInput
    /**
     * Limit how many SchoolDistricts to update.
     */
    limit?: number
  }

  /**
   * SchoolDistrict upsert
   */
  export type SchoolDistrictUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    /**
     * The filter to search for the SchoolDistrict to update in case it exists.
     */
    where: SchoolDistrictWhereUniqueInput
    /**
     * In case the SchoolDistrict found by the `where` argument doesn't exist, create a new SchoolDistrict with this data.
     */
    create: XOR<SchoolDistrictCreateInput, SchoolDistrictUncheckedCreateInput>
    /**
     * In case the SchoolDistrict was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SchoolDistrictUpdateInput, SchoolDistrictUncheckedUpdateInput>
  }

  /**
   * SchoolDistrict delete
   */
  export type SchoolDistrictDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
    /**
     * Filter which SchoolDistrict to delete.
     */
    where: SchoolDistrictWhereUniqueInput
  }

  /**
   * SchoolDistrict deleteMany
   */
  export type SchoolDistrictDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SchoolDistricts to delete
     */
    where?: SchoolDistrictWhereInput
    /**
     * Limit how many SchoolDistricts to delete.
     */
    limit?: number
  }

  /**
   * SchoolDistrict.organizations
   */
  export type SchoolDistrict$organizationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrganizationInclude<ExtArgs> | null
    where?: OrganizationWhereInput
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    cursor?: OrganizationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * SchoolDistrict without action
   */
  export type SchoolDistrictDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolDistrict
     */
    select?: SchoolDistrictSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SchoolDistrict
     */
    omit?: SchoolDistrictOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolDistrictInclude<ExtArgs> | null
  }


  /**
   * Model GrantBookmark
   */

  export type AggregateGrantBookmark = {
    _count: GrantBookmarkCountAggregateOutputType | null
    _avg: GrantBookmarkAvgAggregateOutputType | null
    _sum: GrantBookmarkSumAggregateOutputType | null
    _min: GrantBookmarkMinAggregateOutputType | null
    _max: GrantBookmarkMaxAggregateOutputType | null
  }

  export type GrantBookmarkAvgAggregateOutputType = {
    opportunityId: number | null
  }

  export type GrantBookmarkSumAggregateOutputType = {
    opportunityId: number | null
  }

  export type GrantBookmarkMinAggregateOutputType = {
    id: string | null
    notes: string | null
    createdAt: Date | null
    organizationId: string | null
    userId: string | null
    opportunityId: number | null
  }

  export type GrantBookmarkMaxAggregateOutputType = {
    id: string | null
    notes: string | null
    createdAt: Date | null
    organizationId: string | null
    userId: string | null
    opportunityId: number | null
  }

  export type GrantBookmarkCountAggregateOutputType = {
    id: number
    notes: number
    createdAt: number
    organizationId: number
    userId: number
    opportunityId: number
    _all: number
  }


  export type GrantBookmarkAvgAggregateInputType = {
    opportunityId?: true
  }

  export type GrantBookmarkSumAggregateInputType = {
    opportunityId?: true
  }

  export type GrantBookmarkMinAggregateInputType = {
    id?: true
    notes?: true
    createdAt?: true
    organizationId?: true
    userId?: true
    opportunityId?: true
  }

  export type GrantBookmarkMaxAggregateInputType = {
    id?: true
    notes?: true
    createdAt?: true
    organizationId?: true
    userId?: true
    opportunityId?: true
  }

  export type GrantBookmarkCountAggregateInputType = {
    id?: true
    notes?: true
    createdAt?: true
    organizationId?: true
    userId?: true
    opportunityId?: true
    _all?: true
  }

  export type GrantBookmarkAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GrantBookmark to aggregate.
     */
    where?: GrantBookmarkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GrantBookmarks to fetch.
     */
    orderBy?: GrantBookmarkOrderByWithRelationInput | GrantBookmarkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GrantBookmarkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GrantBookmarks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GrantBookmarks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GrantBookmarks
    **/
    _count?: true | GrantBookmarkCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GrantBookmarkAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GrantBookmarkSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GrantBookmarkMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GrantBookmarkMaxAggregateInputType
  }

  export type GetGrantBookmarkAggregateType<T extends GrantBookmarkAggregateArgs> = {
        [P in keyof T & keyof AggregateGrantBookmark]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGrantBookmark[P]>
      : GetScalarType<T[P], AggregateGrantBookmark[P]>
  }




  export type GrantBookmarkGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GrantBookmarkWhereInput
    orderBy?: GrantBookmarkOrderByWithAggregationInput | GrantBookmarkOrderByWithAggregationInput[]
    by: GrantBookmarkScalarFieldEnum[] | GrantBookmarkScalarFieldEnum
    having?: GrantBookmarkScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GrantBookmarkCountAggregateInputType | true
    _avg?: GrantBookmarkAvgAggregateInputType
    _sum?: GrantBookmarkSumAggregateInputType
    _min?: GrantBookmarkMinAggregateInputType
    _max?: GrantBookmarkMaxAggregateInputType
  }

  export type GrantBookmarkGroupByOutputType = {
    id: string
    notes: string | null
    createdAt: Date
    organizationId: string
    userId: string
    opportunityId: number
    _count: GrantBookmarkCountAggregateOutputType | null
    _avg: GrantBookmarkAvgAggregateOutputType | null
    _sum: GrantBookmarkSumAggregateOutputType | null
    _min: GrantBookmarkMinAggregateOutputType | null
    _max: GrantBookmarkMaxAggregateOutputType | null
  }

  type GetGrantBookmarkGroupByPayload<T extends GrantBookmarkGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GrantBookmarkGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GrantBookmarkGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GrantBookmarkGroupByOutputType[P]>
            : GetScalarType<T[P], GrantBookmarkGroupByOutputType[P]>
        }
      >
    >


  export type GrantBookmarkSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    notes?: boolean
    createdAt?: boolean
    organizationId?: boolean
    userId?: boolean
    opportunityId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["grantBookmark"]>

  export type GrantBookmarkSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    notes?: boolean
    createdAt?: boolean
    organizationId?: boolean
    userId?: boolean
    opportunityId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["grantBookmark"]>

  export type GrantBookmarkSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    notes?: boolean
    createdAt?: boolean
    organizationId?: boolean
    userId?: boolean
    opportunityId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["grantBookmark"]>

  export type GrantBookmarkSelectScalar = {
    id?: boolean
    notes?: boolean
    createdAt?: boolean
    organizationId?: boolean
    userId?: boolean
    opportunityId?: boolean
  }

  export type GrantBookmarkOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "notes" | "createdAt" | "organizationId" | "userId" | "opportunityId", ExtArgs["result"]["grantBookmark"]>
  export type GrantBookmarkInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type GrantBookmarkIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type GrantBookmarkIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $GrantBookmarkPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GrantBookmark"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      notes: string | null
      createdAt: Date
      organizationId: string
      userId: string
      opportunityId: number
    }, ExtArgs["result"]["grantBookmark"]>
    composites: {}
  }

  type GrantBookmarkGetPayload<S extends boolean | null | undefined | GrantBookmarkDefaultArgs> = $Result.GetResult<Prisma.$GrantBookmarkPayload, S>

  type GrantBookmarkCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GrantBookmarkFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GrantBookmarkCountAggregateInputType | true
    }

  export interface GrantBookmarkDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GrantBookmark'], meta: { name: 'GrantBookmark' } }
    /**
     * Find zero or one GrantBookmark that matches the filter.
     * @param {GrantBookmarkFindUniqueArgs} args - Arguments to find a GrantBookmark
     * @example
     * // Get one GrantBookmark
     * const grantBookmark = await prisma.grantBookmark.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GrantBookmarkFindUniqueArgs>(args: SelectSubset<T, GrantBookmarkFindUniqueArgs<ExtArgs>>): Prisma__GrantBookmarkClient<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GrantBookmark that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GrantBookmarkFindUniqueOrThrowArgs} args - Arguments to find a GrantBookmark
     * @example
     * // Get one GrantBookmark
     * const grantBookmark = await prisma.grantBookmark.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GrantBookmarkFindUniqueOrThrowArgs>(args: SelectSubset<T, GrantBookmarkFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GrantBookmarkClient<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GrantBookmark that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantBookmarkFindFirstArgs} args - Arguments to find a GrantBookmark
     * @example
     * // Get one GrantBookmark
     * const grantBookmark = await prisma.grantBookmark.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GrantBookmarkFindFirstArgs>(args?: SelectSubset<T, GrantBookmarkFindFirstArgs<ExtArgs>>): Prisma__GrantBookmarkClient<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GrantBookmark that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantBookmarkFindFirstOrThrowArgs} args - Arguments to find a GrantBookmark
     * @example
     * // Get one GrantBookmark
     * const grantBookmark = await prisma.grantBookmark.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GrantBookmarkFindFirstOrThrowArgs>(args?: SelectSubset<T, GrantBookmarkFindFirstOrThrowArgs<ExtArgs>>): Prisma__GrantBookmarkClient<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GrantBookmarks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantBookmarkFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GrantBookmarks
     * const grantBookmarks = await prisma.grantBookmark.findMany()
     * 
     * // Get first 10 GrantBookmarks
     * const grantBookmarks = await prisma.grantBookmark.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const grantBookmarkWithIdOnly = await prisma.grantBookmark.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GrantBookmarkFindManyArgs>(args?: SelectSubset<T, GrantBookmarkFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GrantBookmark.
     * @param {GrantBookmarkCreateArgs} args - Arguments to create a GrantBookmark.
     * @example
     * // Create one GrantBookmark
     * const GrantBookmark = await prisma.grantBookmark.create({
     *   data: {
     *     // ... data to create a GrantBookmark
     *   }
     * })
     * 
     */
    create<T extends GrantBookmarkCreateArgs>(args: SelectSubset<T, GrantBookmarkCreateArgs<ExtArgs>>): Prisma__GrantBookmarkClient<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GrantBookmarks.
     * @param {GrantBookmarkCreateManyArgs} args - Arguments to create many GrantBookmarks.
     * @example
     * // Create many GrantBookmarks
     * const grantBookmark = await prisma.grantBookmark.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GrantBookmarkCreateManyArgs>(args?: SelectSubset<T, GrantBookmarkCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GrantBookmarks and returns the data saved in the database.
     * @param {GrantBookmarkCreateManyAndReturnArgs} args - Arguments to create many GrantBookmarks.
     * @example
     * // Create many GrantBookmarks
     * const grantBookmark = await prisma.grantBookmark.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GrantBookmarks and only return the `id`
     * const grantBookmarkWithIdOnly = await prisma.grantBookmark.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GrantBookmarkCreateManyAndReturnArgs>(args?: SelectSubset<T, GrantBookmarkCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GrantBookmark.
     * @param {GrantBookmarkDeleteArgs} args - Arguments to delete one GrantBookmark.
     * @example
     * // Delete one GrantBookmark
     * const GrantBookmark = await prisma.grantBookmark.delete({
     *   where: {
     *     // ... filter to delete one GrantBookmark
     *   }
     * })
     * 
     */
    delete<T extends GrantBookmarkDeleteArgs>(args: SelectSubset<T, GrantBookmarkDeleteArgs<ExtArgs>>): Prisma__GrantBookmarkClient<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GrantBookmark.
     * @param {GrantBookmarkUpdateArgs} args - Arguments to update one GrantBookmark.
     * @example
     * // Update one GrantBookmark
     * const grantBookmark = await prisma.grantBookmark.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GrantBookmarkUpdateArgs>(args: SelectSubset<T, GrantBookmarkUpdateArgs<ExtArgs>>): Prisma__GrantBookmarkClient<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GrantBookmarks.
     * @param {GrantBookmarkDeleteManyArgs} args - Arguments to filter GrantBookmarks to delete.
     * @example
     * // Delete a few GrantBookmarks
     * const { count } = await prisma.grantBookmark.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GrantBookmarkDeleteManyArgs>(args?: SelectSubset<T, GrantBookmarkDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GrantBookmarks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantBookmarkUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GrantBookmarks
     * const grantBookmark = await prisma.grantBookmark.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GrantBookmarkUpdateManyArgs>(args: SelectSubset<T, GrantBookmarkUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GrantBookmarks and returns the data updated in the database.
     * @param {GrantBookmarkUpdateManyAndReturnArgs} args - Arguments to update many GrantBookmarks.
     * @example
     * // Update many GrantBookmarks
     * const grantBookmark = await prisma.grantBookmark.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GrantBookmarks and only return the `id`
     * const grantBookmarkWithIdOnly = await prisma.grantBookmark.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GrantBookmarkUpdateManyAndReturnArgs>(args: SelectSubset<T, GrantBookmarkUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GrantBookmark.
     * @param {GrantBookmarkUpsertArgs} args - Arguments to update or create a GrantBookmark.
     * @example
     * // Update or create a GrantBookmark
     * const grantBookmark = await prisma.grantBookmark.upsert({
     *   create: {
     *     // ... data to create a GrantBookmark
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GrantBookmark we want to update
     *   }
     * })
     */
    upsert<T extends GrantBookmarkUpsertArgs>(args: SelectSubset<T, GrantBookmarkUpsertArgs<ExtArgs>>): Prisma__GrantBookmarkClient<$Result.GetResult<Prisma.$GrantBookmarkPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GrantBookmarks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantBookmarkCountArgs} args - Arguments to filter GrantBookmarks to count.
     * @example
     * // Count the number of GrantBookmarks
     * const count = await prisma.grantBookmark.count({
     *   where: {
     *     // ... the filter for the GrantBookmarks we want to count
     *   }
     * })
    **/
    count<T extends GrantBookmarkCountArgs>(
      args?: Subset<T, GrantBookmarkCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GrantBookmarkCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GrantBookmark.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantBookmarkAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GrantBookmarkAggregateArgs>(args: Subset<T, GrantBookmarkAggregateArgs>): Prisma.PrismaPromise<GetGrantBookmarkAggregateType<T>>

    /**
     * Group by GrantBookmark.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantBookmarkGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GrantBookmarkGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GrantBookmarkGroupByArgs['orderBy'] }
        : { orderBy?: GrantBookmarkGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GrantBookmarkGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGrantBookmarkGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GrantBookmark model
   */
  readonly fields: GrantBookmarkFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GrantBookmark.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GrantBookmarkClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GrantBookmark model
   */
  interface GrantBookmarkFieldRefs {
    readonly id: FieldRef<"GrantBookmark", 'String'>
    readonly notes: FieldRef<"GrantBookmark", 'String'>
    readonly createdAt: FieldRef<"GrantBookmark", 'DateTime'>
    readonly organizationId: FieldRef<"GrantBookmark", 'String'>
    readonly userId: FieldRef<"GrantBookmark", 'String'>
    readonly opportunityId: FieldRef<"GrantBookmark", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * GrantBookmark findUnique
   */
  export type GrantBookmarkFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    /**
     * Filter, which GrantBookmark to fetch.
     */
    where: GrantBookmarkWhereUniqueInput
  }

  /**
   * GrantBookmark findUniqueOrThrow
   */
  export type GrantBookmarkFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    /**
     * Filter, which GrantBookmark to fetch.
     */
    where: GrantBookmarkWhereUniqueInput
  }

  /**
   * GrantBookmark findFirst
   */
  export type GrantBookmarkFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    /**
     * Filter, which GrantBookmark to fetch.
     */
    where?: GrantBookmarkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GrantBookmarks to fetch.
     */
    orderBy?: GrantBookmarkOrderByWithRelationInput | GrantBookmarkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GrantBookmarks.
     */
    cursor?: GrantBookmarkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GrantBookmarks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GrantBookmarks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GrantBookmarks.
     */
    distinct?: GrantBookmarkScalarFieldEnum | GrantBookmarkScalarFieldEnum[]
  }

  /**
   * GrantBookmark findFirstOrThrow
   */
  export type GrantBookmarkFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    /**
     * Filter, which GrantBookmark to fetch.
     */
    where?: GrantBookmarkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GrantBookmarks to fetch.
     */
    orderBy?: GrantBookmarkOrderByWithRelationInput | GrantBookmarkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GrantBookmarks.
     */
    cursor?: GrantBookmarkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GrantBookmarks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GrantBookmarks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GrantBookmarks.
     */
    distinct?: GrantBookmarkScalarFieldEnum | GrantBookmarkScalarFieldEnum[]
  }

  /**
   * GrantBookmark findMany
   */
  export type GrantBookmarkFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    /**
     * Filter, which GrantBookmarks to fetch.
     */
    where?: GrantBookmarkWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GrantBookmarks to fetch.
     */
    orderBy?: GrantBookmarkOrderByWithRelationInput | GrantBookmarkOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GrantBookmarks.
     */
    cursor?: GrantBookmarkWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GrantBookmarks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GrantBookmarks.
     */
    skip?: number
    distinct?: GrantBookmarkScalarFieldEnum | GrantBookmarkScalarFieldEnum[]
  }

  /**
   * GrantBookmark create
   */
  export type GrantBookmarkCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    /**
     * The data needed to create a GrantBookmark.
     */
    data: XOR<GrantBookmarkCreateInput, GrantBookmarkUncheckedCreateInput>
  }

  /**
   * GrantBookmark createMany
   */
  export type GrantBookmarkCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GrantBookmarks.
     */
    data: GrantBookmarkCreateManyInput | GrantBookmarkCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GrantBookmark createManyAndReturn
   */
  export type GrantBookmarkCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * The data used to create many GrantBookmarks.
     */
    data: GrantBookmarkCreateManyInput | GrantBookmarkCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GrantBookmark update
   */
  export type GrantBookmarkUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    /**
     * The data needed to update a GrantBookmark.
     */
    data: XOR<GrantBookmarkUpdateInput, GrantBookmarkUncheckedUpdateInput>
    /**
     * Choose, which GrantBookmark to update.
     */
    where: GrantBookmarkWhereUniqueInput
  }

  /**
   * GrantBookmark updateMany
   */
  export type GrantBookmarkUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GrantBookmarks.
     */
    data: XOR<GrantBookmarkUpdateManyMutationInput, GrantBookmarkUncheckedUpdateManyInput>
    /**
     * Filter which GrantBookmarks to update
     */
    where?: GrantBookmarkWhereInput
    /**
     * Limit how many GrantBookmarks to update.
     */
    limit?: number
  }

  /**
   * GrantBookmark updateManyAndReturn
   */
  export type GrantBookmarkUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * The data used to update GrantBookmarks.
     */
    data: XOR<GrantBookmarkUpdateManyMutationInput, GrantBookmarkUncheckedUpdateManyInput>
    /**
     * Filter which GrantBookmarks to update
     */
    where?: GrantBookmarkWhereInput
    /**
     * Limit how many GrantBookmarks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * GrantBookmark upsert
   */
  export type GrantBookmarkUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    /**
     * The filter to search for the GrantBookmark to update in case it exists.
     */
    where: GrantBookmarkWhereUniqueInput
    /**
     * In case the GrantBookmark found by the `where` argument doesn't exist, create a new GrantBookmark with this data.
     */
    create: XOR<GrantBookmarkCreateInput, GrantBookmarkUncheckedCreateInput>
    /**
     * In case the GrantBookmark was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GrantBookmarkUpdateInput, GrantBookmarkUncheckedUpdateInput>
  }

  /**
   * GrantBookmark delete
   */
  export type GrantBookmarkDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
    /**
     * Filter which GrantBookmark to delete.
     */
    where: GrantBookmarkWhereUniqueInput
  }

  /**
   * GrantBookmark deleteMany
   */
  export type GrantBookmarkDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GrantBookmarks to delete
     */
    where?: GrantBookmarkWhereInput
    /**
     * Limit how many GrantBookmarks to delete.
     */
    limit?: number
  }

  /**
   * GrantBookmark without action
   */
  export type GrantBookmarkDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantBookmark
     */
    select?: GrantBookmarkSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantBookmark
     */
    omit?: GrantBookmarkOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantBookmarkInclude<ExtArgs> | null
  }


  /**
   * Model GrantEligibilityAnalysis
   */

  export type AggregateGrantEligibilityAnalysis = {
    _count: GrantEligibilityAnalysisCountAggregateOutputType | null
    _avg: GrantEligibilityAnalysisAvgAggregateOutputType | null
    _sum: GrantEligibilityAnalysisSumAggregateOutputType | null
    _min: GrantEligibilityAnalysisMinAggregateOutputType | null
    _max: GrantEligibilityAnalysisMaxAggregateOutputType | null
  }

  export type GrantEligibilityAnalysisAvgAggregateOutputType = {
    matchScore: number | null
    confidence: number | null
    opportunityId: number | null
  }

  export type GrantEligibilityAnalysisSumAggregateOutputType = {
    matchScore: number | null
    confidence: number | null
    opportunityId: number | null
  }

  export type GrantEligibilityAnalysisMinAggregateOutputType = {
    id: string | null
    matchScore: number | null
    goNoGo: $Enums.GoNoGoDecision | null
    rationale: string | null
    risks: string | null
    confidence: number | null
    createdAt: Date | null
    organizationId: string | null
    opportunityId: number | null
  }

  export type GrantEligibilityAnalysisMaxAggregateOutputType = {
    id: string | null
    matchScore: number | null
    goNoGo: $Enums.GoNoGoDecision | null
    rationale: string | null
    risks: string | null
    confidence: number | null
    createdAt: Date | null
    organizationId: string | null
    opportunityId: number | null
  }

  export type GrantEligibilityAnalysisCountAggregateOutputType = {
    id: number
    matchScore: number
    goNoGo: number
    rationale: number
    risks: number
    confidence: number
    createdAt: number
    organizationId: number
    opportunityId: number
    _all: number
  }


  export type GrantEligibilityAnalysisAvgAggregateInputType = {
    matchScore?: true
    confidence?: true
    opportunityId?: true
  }

  export type GrantEligibilityAnalysisSumAggregateInputType = {
    matchScore?: true
    confidence?: true
    opportunityId?: true
  }

  export type GrantEligibilityAnalysisMinAggregateInputType = {
    id?: true
    matchScore?: true
    goNoGo?: true
    rationale?: true
    risks?: true
    confidence?: true
    createdAt?: true
    organizationId?: true
    opportunityId?: true
  }

  export type GrantEligibilityAnalysisMaxAggregateInputType = {
    id?: true
    matchScore?: true
    goNoGo?: true
    rationale?: true
    risks?: true
    confidence?: true
    createdAt?: true
    organizationId?: true
    opportunityId?: true
  }

  export type GrantEligibilityAnalysisCountAggregateInputType = {
    id?: true
    matchScore?: true
    goNoGo?: true
    rationale?: true
    risks?: true
    confidence?: true
    createdAt?: true
    organizationId?: true
    opportunityId?: true
    _all?: true
  }

  export type GrantEligibilityAnalysisAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GrantEligibilityAnalysis to aggregate.
     */
    where?: GrantEligibilityAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GrantEligibilityAnalyses to fetch.
     */
    orderBy?: GrantEligibilityAnalysisOrderByWithRelationInput | GrantEligibilityAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GrantEligibilityAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GrantEligibilityAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GrantEligibilityAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GrantEligibilityAnalyses
    **/
    _count?: true | GrantEligibilityAnalysisCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GrantEligibilityAnalysisAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GrantEligibilityAnalysisSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GrantEligibilityAnalysisMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GrantEligibilityAnalysisMaxAggregateInputType
  }

  export type GetGrantEligibilityAnalysisAggregateType<T extends GrantEligibilityAnalysisAggregateArgs> = {
        [P in keyof T & keyof AggregateGrantEligibilityAnalysis]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGrantEligibilityAnalysis[P]>
      : GetScalarType<T[P], AggregateGrantEligibilityAnalysis[P]>
  }




  export type GrantEligibilityAnalysisGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GrantEligibilityAnalysisWhereInput
    orderBy?: GrantEligibilityAnalysisOrderByWithAggregationInput | GrantEligibilityAnalysisOrderByWithAggregationInput[]
    by: GrantEligibilityAnalysisScalarFieldEnum[] | GrantEligibilityAnalysisScalarFieldEnum
    having?: GrantEligibilityAnalysisScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GrantEligibilityAnalysisCountAggregateInputType | true
    _avg?: GrantEligibilityAnalysisAvgAggregateInputType
    _sum?: GrantEligibilityAnalysisSumAggregateInputType
    _min?: GrantEligibilityAnalysisMinAggregateInputType
    _max?: GrantEligibilityAnalysisMaxAggregateInputType
  }

  export type GrantEligibilityAnalysisGroupByOutputType = {
    id: string
    matchScore: number
    goNoGo: $Enums.GoNoGoDecision
    rationale: string
    risks: string | null
    confidence: number | null
    createdAt: Date
    organizationId: string
    opportunityId: number
    _count: GrantEligibilityAnalysisCountAggregateOutputType | null
    _avg: GrantEligibilityAnalysisAvgAggregateOutputType | null
    _sum: GrantEligibilityAnalysisSumAggregateOutputType | null
    _min: GrantEligibilityAnalysisMinAggregateOutputType | null
    _max: GrantEligibilityAnalysisMaxAggregateOutputType | null
  }

  type GetGrantEligibilityAnalysisGroupByPayload<T extends GrantEligibilityAnalysisGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GrantEligibilityAnalysisGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GrantEligibilityAnalysisGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GrantEligibilityAnalysisGroupByOutputType[P]>
            : GetScalarType<T[P], GrantEligibilityAnalysisGroupByOutputType[P]>
        }
      >
    >


  export type GrantEligibilityAnalysisSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    matchScore?: boolean
    goNoGo?: boolean
    rationale?: boolean
    risks?: boolean
    confidence?: boolean
    createdAt?: boolean
    organizationId?: boolean
    opportunityId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["grantEligibilityAnalysis"]>

  export type GrantEligibilityAnalysisSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    matchScore?: boolean
    goNoGo?: boolean
    rationale?: boolean
    risks?: boolean
    confidence?: boolean
    createdAt?: boolean
    organizationId?: boolean
    opportunityId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["grantEligibilityAnalysis"]>

  export type GrantEligibilityAnalysisSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    matchScore?: boolean
    goNoGo?: boolean
    rationale?: boolean
    risks?: boolean
    confidence?: boolean
    createdAt?: boolean
    organizationId?: boolean
    opportunityId?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["grantEligibilityAnalysis"]>

  export type GrantEligibilityAnalysisSelectScalar = {
    id?: boolean
    matchScore?: boolean
    goNoGo?: boolean
    rationale?: boolean
    risks?: boolean
    confidence?: boolean
    createdAt?: boolean
    organizationId?: boolean
    opportunityId?: boolean
  }

  export type GrantEligibilityAnalysisOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "matchScore" | "goNoGo" | "rationale" | "risks" | "confidence" | "createdAt" | "organizationId" | "opportunityId", ExtArgs["result"]["grantEligibilityAnalysis"]>
  export type GrantEligibilityAnalysisInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type GrantEligibilityAnalysisIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type GrantEligibilityAnalysisIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $GrantEligibilityAnalysisPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GrantEligibilityAnalysis"
    objects: {
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      matchScore: number
      goNoGo: $Enums.GoNoGoDecision
      rationale: string
      risks: string | null
      confidence: number | null
      createdAt: Date
      organizationId: string
      opportunityId: number
    }, ExtArgs["result"]["grantEligibilityAnalysis"]>
    composites: {}
  }

  type GrantEligibilityAnalysisGetPayload<S extends boolean | null | undefined | GrantEligibilityAnalysisDefaultArgs> = $Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload, S>

  type GrantEligibilityAnalysisCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GrantEligibilityAnalysisFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GrantEligibilityAnalysisCountAggregateInputType | true
    }

  export interface GrantEligibilityAnalysisDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GrantEligibilityAnalysis'], meta: { name: 'GrantEligibilityAnalysis' } }
    /**
     * Find zero or one GrantEligibilityAnalysis that matches the filter.
     * @param {GrantEligibilityAnalysisFindUniqueArgs} args - Arguments to find a GrantEligibilityAnalysis
     * @example
     * // Get one GrantEligibilityAnalysis
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GrantEligibilityAnalysisFindUniqueArgs>(args: SelectSubset<T, GrantEligibilityAnalysisFindUniqueArgs<ExtArgs>>): Prisma__GrantEligibilityAnalysisClient<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GrantEligibilityAnalysis that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GrantEligibilityAnalysisFindUniqueOrThrowArgs} args - Arguments to find a GrantEligibilityAnalysis
     * @example
     * // Get one GrantEligibilityAnalysis
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GrantEligibilityAnalysisFindUniqueOrThrowArgs>(args: SelectSubset<T, GrantEligibilityAnalysisFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GrantEligibilityAnalysisClient<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GrantEligibilityAnalysis that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantEligibilityAnalysisFindFirstArgs} args - Arguments to find a GrantEligibilityAnalysis
     * @example
     * // Get one GrantEligibilityAnalysis
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GrantEligibilityAnalysisFindFirstArgs>(args?: SelectSubset<T, GrantEligibilityAnalysisFindFirstArgs<ExtArgs>>): Prisma__GrantEligibilityAnalysisClient<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GrantEligibilityAnalysis that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantEligibilityAnalysisFindFirstOrThrowArgs} args - Arguments to find a GrantEligibilityAnalysis
     * @example
     * // Get one GrantEligibilityAnalysis
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GrantEligibilityAnalysisFindFirstOrThrowArgs>(args?: SelectSubset<T, GrantEligibilityAnalysisFindFirstOrThrowArgs<ExtArgs>>): Prisma__GrantEligibilityAnalysisClient<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GrantEligibilityAnalyses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantEligibilityAnalysisFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GrantEligibilityAnalyses
     * const grantEligibilityAnalyses = await prisma.grantEligibilityAnalysis.findMany()
     * 
     * // Get first 10 GrantEligibilityAnalyses
     * const grantEligibilityAnalyses = await prisma.grantEligibilityAnalysis.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const grantEligibilityAnalysisWithIdOnly = await prisma.grantEligibilityAnalysis.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GrantEligibilityAnalysisFindManyArgs>(args?: SelectSubset<T, GrantEligibilityAnalysisFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GrantEligibilityAnalysis.
     * @param {GrantEligibilityAnalysisCreateArgs} args - Arguments to create a GrantEligibilityAnalysis.
     * @example
     * // Create one GrantEligibilityAnalysis
     * const GrantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.create({
     *   data: {
     *     // ... data to create a GrantEligibilityAnalysis
     *   }
     * })
     * 
     */
    create<T extends GrantEligibilityAnalysisCreateArgs>(args: SelectSubset<T, GrantEligibilityAnalysisCreateArgs<ExtArgs>>): Prisma__GrantEligibilityAnalysisClient<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GrantEligibilityAnalyses.
     * @param {GrantEligibilityAnalysisCreateManyArgs} args - Arguments to create many GrantEligibilityAnalyses.
     * @example
     * // Create many GrantEligibilityAnalyses
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GrantEligibilityAnalysisCreateManyArgs>(args?: SelectSubset<T, GrantEligibilityAnalysisCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GrantEligibilityAnalyses and returns the data saved in the database.
     * @param {GrantEligibilityAnalysisCreateManyAndReturnArgs} args - Arguments to create many GrantEligibilityAnalyses.
     * @example
     * // Create many GrantEligibilityAnalyses
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GrantEligibilityAnalyses and only return the `id`
     * const grantEligibilityAnalysisWithIdOnly = await prisma.grantEligibilityAnalysis.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GrantEligibilityAnalysisCreateManyAndReturnArgs>(args?: SelectSubset<T, GrantEligibilityAnalysisCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GrantEligibilityAnalysis.
     * @param {GrantEligibilityAnalysisDeleteArgs} args - Arguments to delete one GrantEligibilityAnalysis.
     * @example
     * // Delete one GrantEligibilityAnalysis
     * const GrantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.delete({
     *   where: {
     *     // ... filter to delete one GrantEligibilityAnalysis
     *   }
     * })
     * 
     */
    delete<T extends GrantEligibilityAnalysisDeleteArgs>(args: SelectSubset<T, GrantEligibilityAnalysisDeleteArgs<ExtArgs>>): Prisma__GrantEligibilityAnalysisClient<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GrantEligibilityAnalysis.
     * @param {GrantEligibilityAnalysisUpdateArgs} args - Arguments to update one GrantEligibilityAnalysis.
     * @example
     * // Update one GrantEligibilityAnalysis
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GrantEligibilityAnalysisUpdateArgs>(args: SelectSubset<T, GrantEligibilityAnalysisUpdateArgs<ExtArgs>>): Prisma__GrantEligibilityAnalysisClient<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GrantEligibilityAnalyses.
     * @param {GrantEligibilityAnalysisDeleteManyArgs} args - Arguments to filter GrantEligibilityAnalyses to delete.
     * @example
     * // Delete a few GrantEligibilityAnalyses
     * const { count } = await prisma.grantEligibilityAnalysis.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GrantEligibilityAnalysisDeleteManyArgs>(args?: SelectSubset<T, GrantEligibilityAnalysisDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GrantEligibilityAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantEligibilityAnalysisUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GrantEligibilityAnalyses
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GrantEligibilityAnalysisUpdateManyArgs>(args: SelectSubset<T, GrantEligibilityAnalysisUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GrantEligibilityAnalyses and returns the data updated in the database.
     * @param {GrantEligibilityAnalysisUpdateManyAndReturnArgs} args - Arguments to update many GrantEligibilityAnalyses.
     * @example
     * // Update many GrantEligibilityAnalyses
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GrantEligibilityAnalyses and only return the `id`
     * const grantEligibilityAnalysisWithIdOnly = await prisma.grantEligibilityAnalysis.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GrantEligibilityAnalysisUpdateManyAndReturnArgs>(args: SelectSubset<T, GrantEligibilityAnalysisUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GrantEligibilityAnalysis.
     * @param {GrantEligibilityAnalysisUpsertArgs} args - Arguments to update or create a GrantEligibilityAnalysis.
     * @example
     * // Update or create a GrantEligibilityAnalysis
     * const grantEligibilityAnalysis = await prisma.grantEligibilityAnalysis.upsert({
     *   create: {
     *     // ... data to create a GrantEligibilityAnalysis
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GrantEligibilityAnalysis we want to update
     *   }
     * })
     */
    upsert<T extends GrantEligibilityAnalysisUpsertArgs>(args: SelectSubset<T, GrantEligibilityAnalysisUpsertArgs<ExtArgs>>): Prisma__GrantEligibilityAnalysisClient<$Result.GetResult<Prisma.$GrantEligibilityAnalysisPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GrantEligibilityAnalyses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantEligibilityAnalysisCountArgs} args - Arguments to filter GrantEligibilityAnalyses to count.
     * @example
     * // Count the number of GrantEligibilityAnalyses
     * const count = await prisma.grantEligibilityAnalysis.count({
     *   where: {
     *     // ... the filter for the GrantEligibilityAnalyses we want to count
     *   }
     * })
    **/
    count<T extends GrantEligibilityAnalysisCountArgs>(
      args?: Subset<T, GrantEligibilityAnalysisCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GrantEligibilityAnalysisCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GrantEligibilityAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantEligibilityAnalysisAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GrantEligibilityAnalysisAggregateArgs>(args: Subset<T, GrantEligibilityAnalysisAggregateArgs>): Prisma.PrismaPromise<GetGrantEligibilityAnalysisAggregateType<T>>

    /**
     * Group by GrantEligibilityAnalysis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GrantEligibilityAnalysisGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GrantEligibilityAnalysisGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GrantEligibilityAnalysisGroupByArgs['orderBy'] }
        : { orderBy?: GrantEligibilityAnalysisGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GrantEligibilityAnalysisGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGrantEligibilityAnalysisGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GrantEligibilityAnalysis model
   */
  readonly fields: GrantEligibilityAnalysisFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GrantEligibilityAnalysis.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GrantEligibilityAnalysisClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GrantEligibilityAnalysis model
   */
  interface GrantEligibilityAnalysisFieldRefs {
    readonly id: FieldRef<"GrantEligibilityAnalysis", 'String'>
    readonly matchScore: FieldRef<"GrantEligibilityAnalysis", 'Int'>
    readonly goNoGo: FieldRef<"GrantEligibilityAnalysis", 'GoNoGoDecision'>
    readonly rationale: FieldRef<"GrantEligibilityAnalysis", 'String'>
    readonly risks: FieldRef<"GrantEligibilityAnalysis", 'String'>
    readonly confidence: FieldRef<"GrantEligibilityAnalysis", 'Float'>
    readonly createdAt: FieldRef<"GrantEligibilityAnalysis", 'DateTime'>
    readonly organizationId: FieldRef<"GrantEligibilityAnalysis", 'String'>
    readonly opportunityId: FieldRef<"GrantEligibilityAnalysis", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * GrantEligibilityAnalysis findUnique
   */
  export type GrantEligibilityAnalysisFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which GrantEligibilityAnalysis to fetch.
     */
    where: GrantEligibilityAnalysisWhereUniqueInput
  }

  /**
   * GrantEligibilityAnalysis findUniqueOrThrow
   */
  export type GrantEligibilityAnalysisFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which GrantEligibilityAnalysis to fetch.
     */
    where: GrantEligibilityAnalysisWhereUniqueInput
  }

  /**
   * GrantEligibilityAnalysis findFirst
   */
  export type GrantEligibilityAnalysisFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which GrantEligibilityAnalysis to fetch.
     */
    where?: GrantEligibilityAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GrantEligibilityAnalyses to fetch.
     */
    orderBy?: GrantEligibilityAnalysisOrderByWithRelationInput | GrantEligibilityAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GrantEligibilityAnalyses.
     */
    cursor?: GrantEligibilityAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GrantEligibilityAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GrantEligibilityAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GrantEligibilityAnalyses.
     */
    distinct?: GrantEligibilityAnalysisScalarFieldEnum | GrantEligibilityAnalysisScalarFieldEnum[]
  }

  /**
   * GrantEligibilityAnalysis findFirstOrThrow
   */
  export type GrantEligibilityAnalysisFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which GrantEligibilityAnalysis to fetch.
     */
    where?: GrantEligibilityAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GrantEligibilityAnalyses to fetch.
     */
    orderBy?: GrantEligibilityAnalysisOrderByWithRelationInput | GrantEligibilityAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GrantEligibilityAnalyses.
     */
    cursor?: GrantEligibilityAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GrantEligibilityAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GrantEligibilityAnalyses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GrantEligibilityAnalyses.
     */
    distinct?: GrantEligibilityAnalysisScalarFieldEnum | GrantEligibilityAnalysisScalarFieldEnum[]
  }

  /**
   * GrantEligibilityAnalysis findMany
   */
  export type GrantEligibilityAnalysisFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    /**
     * Filter, which GrantEligibilityAnalyses to fetch.
     */
    where?: GrantEligibilityAnalysisWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GrantEligibilityAnalyses to fetch.
     */
    orderBy?: GrantEligibilityAnalysisOrderByWithRelationInput | GrantEligibilityAnalysisOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GrantEligibilityAnalyses.
     */
    cursor?: GrantEligibilityAnalysisWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GrantEligibilityAnalyses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GrantEligibilityAnalyses.
     */
    skip?: number
    distinct?: GrantEligibilityAnalysisScalarFieldEnum | GrantEligibilityAnalysisScalarFieldEnum[]
  }

  /**
   * GrantEligibilityAnalysis create
   */
  export type GrantEligibilityAnalysisCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    /**
     * The data needed to create a GrantEligibilityAnalysis.
     */
    data: XOR<GrantEligibilityAnalysisCreateInput, GrantEligibilityAnalysisUncheckedCreateInput>
  }

  /**
   * GrantEligibilityAnalysis createMany
   */
  export type GrantEligibilityAnalysisCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GrantEligibilityAnalyses.
     */
    data: GrantEligibilityAnalysisCreateManyInput | GrantEligibilityAnalysisCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GrantEligibilityAnalysis createManyAndReturn
   */
  export type GrantEligibilityAnalysisCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * The data used to create many GrantEligibilityAnalyses.
     */
    data: GrantEligibilityAnalysisCreateManyInput | GrantEligibilityAnalysisCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GrantEligibilityAnalysis update
   */
  export type GrantEligibilityAnalysisUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    /**
     * The data needed to update a GrantEligibilityAnalysis.
     */
    data: XOR<GrantEligibilityAnalysisUpdateInput, GrantEligibilityAnalysisUncheckedUpdateInput>
    /**
     * Choose, which GrantEligibilityAnalysis to update.
     */
    where: GrantEligibilityAnalysisWhereUniqueInput
  }

  /**
   * GrantEligibilityAnalysis updateMany
   */
  export type GrantEligibilityAnalysisUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GrantEligibilityAnalyses.
     */
    data: XOR<GrantEligibilityAnalysisUpdateManyMutationInput, GrantEligibilityAnalysisUncheckedUpdateManyInput>
    /**
     * Filter which GrantEligibilityAnalyses to update
     */
    where?: GrantEligibilityAnalysisWhereInput
    /**
     * Limit how many GrantEligibilityAnalyses to update.
     */
    limit?: number
  }

  /**
   * GrantEligibilityAnalysis updateManyAndReturn
   */
  export type GrantEligibilityAnalysisUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * The data used to update GrantEligibilityAnalyses.
     */
    data: XOR<GrantEligibilityAnalysisUpdateManyMutationInput, GrantEligibilityAnalysisUncheckedUpdateManyInput>
    /**
     * Filter which GrantEligibilityAnalyses to update
     */
    where?: GrantEligibilityAnalysisWhereInput
    /**
     * Limit how many GrantEligibilityAnalyses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * GrantEligibilityAnalysis upsert
   */
  export type GrantEligibilityAnalysisUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    /**
     * The filter to search for the GrantEligibilityAnalysis to update in case it exists.
     */
    where: GrantEligibilityAnalysisWhereUniqueInput
    /**
     * In case the GrantEligibilityAnalysis found by the `where` argument doesn't exist, create a new GrantEligibilityAnalysis with this data.
     */
    create: XOR<GrantEligibilityAnalysisCreateInput, GrantEligibilityAnalysisUncheckedCreateInput>
    /**
     * In case the GrantEligibilityAnalysis was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GrantEligibilityAnalysisUpdateInput, GrantEligibilityAnalysisUncheckedUpdateInput>
  }

  /**
   * GrantEligibilityAnalysis delete
   */
  export type GrantEligibilityAnalysisDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
    /**
     * Filter which GrantEligibilityAnalysis to delete.
     */
    where: GrantEligibilityAnalysisWhereUniqueInput
  }

  /**
   * GrantEligibilityAnalysis deleteMany
   */
  export type GrantEligibilityAnalysisDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GrantEligibilityAnalyses to delete
     */
    where?: GrantEligibilityAnalysisWhereInput
    /**
     * Limit how many GrantEligibilityAnalyses to delete.
     */
    limit?: number
  }

  /**
   * GrantEligibilityAnalysis without action
   */
  export type GrantEligibilityAnalysisDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GrantEligibilityAnalysis
     */
    select?: GrantEligibilityAnalysisSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GrantEligibilityAnalysis
     */
    omit?: GrantEligibilityAnalysisOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GrantEligibilityAnalysisInclude<ExtArgs> | null
  }


  /**
   * Model Application
   */

  export type AggregateApplication = {
    _count: ApplicationCountAggregateOutputType | null
    _avg: ApplicationAvgAggregateOutputType | null
    _sum: ApplicationSumAggregateOutputType | null
    _min: ApplicationMinAggregateOutputType | null
    _max: ApplicationMaxAggregateOutputType | null
  }

  export type ApplicationAvgAggregateOutputType = {
    opportunityId: number | null
  }

  export type ApplicationSumAggregateOutputType = {
    opportunityId: number | null
  }

  export type ApplicationMinAggregateOutputType = {
    id: string | null
    opportunityId: number | null
    organizationId: string | null
    status: $Enums.ApplicationStatus | null
    contentHtml: string | null
    title: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
    submittedAt: Date | null
    lastEditedAt: Date | null
  }

  export type ApplicationMaxAggregateOutputType = {
    id: string | null
    opportunityId: number | null
    organizationId: string | null
    status: $Enums.ApplicationStatus | null
    contentHtml: string | null
    title: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
    submittedAt: Date | null
    lastEditedAt: Date | null
  }

  export type ApplicationCountAggregateOutputType = {
    id: number
    opportunityId: number
    organizationId: number
    status: number
    content: number
    contentHtml: number
    title: number
    notes: number
    documents: number
    createdAt: number
    updatedAt: number
    submittedAt: number
    lastEditedAt: number
    _all: number
  }


  export type ApplicationAvgAggregateInputType = {
    opportunityId?: true
  }

  export type ApplicationSumAggregateInputType = {
    opportunityId?: true
  }

  export type ApplicationMinAggregateInputType = {
    id?: true
    opportunityId?: true
    organizationId?: true
    status?: true
    contentHtml?: true
    title?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    submittedAt?: true
    lastEditedAt?: true
  }

  export type ApplicationMaxAggregateInputType = {
    id?: true
    opportunityId?: true
    organizationId?: true
    status?: true
    contentHtml?: true
    title?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    submittedAt?: true
    lastEditedAt?: true
  }

  export type ApplicationCountAggregateInputType = {
    id?: true
    opportunityId?: true
    organizationId?: true
    status?: true
    content?: true
    contentHtml?: true
    title?: true
    notes?: true
    documents?: true
    createdAt?: true
    updatedAt?: true
    submittedAt?: true
    lastEditedAt?: true
    _all?: true
  }

  export type ApplicationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Application to aggregate.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Applications
    **/
    _count?: true | ApplicationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApplicationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApplicationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApplicationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApplicationMaxAggregateInputType
  }

  export type GetApplicationAggregateType<T extends ApplicationAggregateArgs> = {
        [P in keyof T & keyof AggregateApplication]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApplication[P]>
      : GetScalarType<T[P], AggregateApplication[P]>
  }




  export type ApplicationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApplicationWhereInput
    orderBy?: ApplicationOrderByWithAggregationInput | ApplicationOrderByWithAggregationInput[]
    by: ApplicationScalarFieldEnum[] | ApplicationScalarFieldEnum
    having?: ApplicationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApplicationCountAggregateInputType | true
    _avg?: ApplicationAvgAggregateInputType
    _sum?: ApplicationSumAggregateInputType
    _min?: ApplicationMinAggregateInputType
    _max?: ApplicationMaxAggregateInputType
  }

  export type ApplicationGroupByOutputType = {
    id: string
    opportunityId: number
    organizationId: string
    status: $Enums.ApplicationStatus
    content: JsonValue | null
    contentHtml: string | null
    title: string | null
    notes: string | null
    documents: JsonValue | null
    createdAt: Date
    updatedAt: Date
    submittedAt: Date | null
    lastEditedAt: Date
    _count: ApplicationCountAggregateOutputType | null
    _avg: ApplicationAvgAggregateOutputType | null
    _sum: ApplicationSumAggregateOutputType | null
    _min: ApplicationMinAggregateOutputType | null
    _max: ApplicationMaxAggregateOutputType | null
  }

  type GetApplicationGroupByPayload<T extends ApplicationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApplicationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApplicationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApplicationGroupByOutputType[P]>
            : GetScalarType<T[P], ApplicationGroupByOutputType[P]>
        }
      >
    >


  export type ApplicationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    opportunityId?: boolean
    organizationId?: boolean
    status?: boolean
    content?: boolean
    contentHtml?: boolean
    title?: boolean
    notes?: boolean
    documents?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    submittedAt?: boolean
    lastEditedAt?: boolean
    aiChats?: boolean | Application$aiChatsArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    _count?: boolean | ApplicationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["application"]>

  export type ApplicationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    opportunityId?: boolean
    organizationId?: boolean
    status?: boolean
    content?: boolean
    contentHtml?: boolean
    title?: boolean
    notes?: boolean
    documents?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    submittedAt?: boolean
    lastEditedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["application"]>

  export type ApplicationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    opportunityId?: boolean
    organizationId?: boolean
    status?: boolean
    content?: boolean
    contentHtml?: boolean
    title?: boolean
    notes?: boolean
    documents?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    submittedAt?: boolean
    lastEditedAt?: boolean
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["application"]>

  export type ApplicationSelectScalar = {
    id?: boolean
    opportunityId?: boolean
    organizationId?: boolean
    status?: boolean
    content?: boolean
    contentHtml?: boolean
    title?: boolean
    notes?: boolean
    documents?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    submittedAt?: boolean
    lastEditedAt?: boolean
  }

  export type ApplicationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "opportunityId" | "organizationId" | "status" | "content" | "contentHtml" | "title" | "notes" | "documents" | "createdAt" | "updatedAt" | "submittedAt" | "lastEditedAt", ExtArgs["result"]["application"]>
  export type ApplicationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    aiChats?: boolean | Application$aiChatsArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    _count?: boolean | ApplicationCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ApplicationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type ApplicationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $ApplicationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Application"
    objects: {
      aiChats: Prisma.$AiChatPayload<ExtArgs>[]
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      opportunityId: number
      organizationId: string
      status: $Enums.ApplicationStatus
      content: Prisma.JsonValue | null
      contentHtml: string | null
      title: string | null
      notes: string | null
      documents: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
      submittedAt: Date | null
      lastEditedAt: Date
    }, ExtArgs["result"]["application"]>
    composites: {}
  }

  type ApplicationGetPayload<S extends boolean | null | undefined | ApplicationDefaultArgs> = $Result.GetResult<Prisma.$ApplicationPayload, S>

  type ApplicationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApplicationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApplicationCountAggregateInputType | true
    }

  export interface ApplicationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Application'], meta: { name: 'Application' } }
    /**
     * Find zero or one Application that matches the filter.
     * @param {ApplicationFindUniqueArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApplicationFindUniqueArgs>(args: SelectSubset<T, ApplicationFindUniqueArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Application that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApplicationFindUniqueOrThrowArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApplicationFindUniqueOrThrowArgs>(args: SelectSubset<T, ApplicationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Application that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFindFirstArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApplicationFindFirstArgs>(args?: SelectSubset<T, ApplicationFindFirstArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Application that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFindFirstOrThrowArgs} args - Arguments to find a Application
     * @example
     * // Get one Application
     * const application = await prisma.application.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApplicationFindFirstOrThrowArgs>(args?: SelectSubset<T, ApplicationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Applications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Applications
     * const applications = await prisma.application.findMany()
     * 
     * // Get first 10 Applications
     * const applications = await prisma.application.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const applicationWithIdOnly = await prisma.application.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApplicationFindManyArgs>(args?: SelectSubset<T, ApplicationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Application.
     * @param {ApplicationCreateArgs} args - Arguments to create a Application.
     * @example
     * // Create one Application
     * const Application = await prisma.application.create({
     *   data: {
     *     // ... data to create a Application
     *   }
     * })
     * 
     */
    create<T extends ApplicationCreateArgs>(args: SelectSubset<T, ApplicationCreateArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Applications.
     * @param {ApplicationCreateManyArgs} args - Arguments to create many Applications.
     * @example
     * // Create many Applications
     * const application = await prisma.application.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApplicationCreateManyArgs>(args?: SelectSubset<T, ApplicationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Applications and returns the data saved in the database.
     * @param {ApplicationCreateManyAndReturnArgs} args - Arguments to create many Applications.
     * @example
     * // Create many Applications
     * const application = await prisma.application.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Applications and only return the `id`
     * const applicationWithIdOnly = await prisma.application.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApplicationCreateManyAndReturnArgs>(args?: SelectSubset<T, ApplicationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Application.
     * @param {ApplicationDeleteArgs} args - Arguments to delete one Application.
     * @example
     * // Delete one Application
     * const Application = await prisma.application.delete({
     *   where: {
     *     // ... filter to delete one Application
     *   }
     * })
     * 
     */
    delete<T extends ApplicationDeleteArgs>(args: SelectSubset<T, ApplicationDeleteArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Application.
     * @param {ApplicationUpdateArgs} args - Arguments to update one Application.
     * @example
     * // Update one Application
     * const application = await prisma.application.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApplicationUpdateArgs>(args: SelectSubset<T, ApplicationUpdateArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Applications.
     * @param {ApplicationDeleteManyArgs} args - Arguments to filter Applications to delete.
     * @example
     * // Delete a few Applications
     * const { count } = await prisma.application.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApplicationDeleteManyArgs>(args?: SelectSubset<T, ApplicationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Applications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Applications
     * const application = await prisma.application.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApplicationUpdateManyArgs>(args: SelectSubset<T, ApplicationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Applications and returns the data updated in the database.
     * @param {ApplicationUpdateManyAndReturnArgs} args - Arguments to update many Applications.
     * @example
     * // Update many Applications
     * const application = await prisma.application.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Applications and only return the `id`
     * const applicationWithIdOnly = await prisma.application.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApplicationUpdateManyAndReturnArgs>(args: SelectSubset<T, ApplicationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Application.
     * @param {ApplicationUpsertArgs} args - Arguments to update or create a Application.
     * @example
     * // Update or create a Application
     * const application = await prisma.application.upsert({
     *   create: {
     *     // ... data to create a Application
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Application we want to update
     *   }
     * })
     */
    upsert<T extends ApplicationUpsertArgs>(args: SelectSubset<T, ApplicationUpsertArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Applications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationCountArgs} args - Arguments to filter Applications to count.
     * @example
     * // Count the number of Applications
     * const count = await prisma.application.count({
     *   where: {
     *     // ... the filter for the Applications we want to count
     *   }
     * })
    **/
    count<T extends ApplicationCountArgs>(
      args?: Subset<T, ApplicationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApplicationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Application.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApplicationAggregateArgs>(args: Subset<T, ApplicationAggregateArgs>): Prisma.PrismaPromise<GetApplicationAggregateType<T>>

    /**
     * Group by Application.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApplicationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApplicationGroupByArgs['orderBy'] }
        : { orderBy?: ApplicationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApplicationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApplicationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Application model
   */
  readonly fields: ApplicationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Application.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApplicationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    aiChats<T extends Application$aiChatsArgs<ExtArgs> = {}>(args?: Subset<T, Application$aiChatsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Application model
   */
  interface ApplicationFieldRefs {
    readonly id: FieldRef<"Application", 'String'>
    readonly opportunityId: FieldRef<"Application", 'Int'>
    readonly organizationId: FieldRef<"Application", 'String'>
    readonly status: FieldRef<"Application", 'ApplicationStatus'>
    readonly content: FieldRef<"Application", 'Json'>
    readonly contentHtml: FieldRef<"Application", 'String'>
    readonly title: FieldRef<"Application", 'String'>
    readonly notes: FieldRef<"Application", 'String'>
    readonly documents: FieldRef<"Application", 'Json'>
    readonly createdAt: FieldRef<"Application", 'DateTime'>
    readonly updatedAt: FieldRef<"Application", 'DateTime'>
    readonly submittedAt: FieldRef<"Application", 'DateTime'>
    readonly lastEditedAt: FieldRef<"Application", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Application findUnique
   */
  export type ApplicationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application findUniqueOrThrow
   */
  export type ApplicationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application findFirst
   */
  export type ApplicationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Applications.
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Applications.
     */
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Application findFirstOrThrow
   */
  export type ApplicationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Application to fetch.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Applications.
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Applications.
     */
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Application findMany
   */
  export type ApplicationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter, which Applications to fetch.
     */
    where?: ApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Applications to fetch.
     */
    orderBy?: ApplicationOrderByWithRelationInput | ApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Applications.
     */
    cursor?: ApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Applications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Applications.
     */
    skip?: number
    distinct?: ApplicationScalarFieldEnum | ApplicationScalarFieldEnum[]
  }

  /**
   * Application create
   */
  export type ApplicationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * The data needed to create a Application.
     */
    data: XOR<ApplicationCreateInput, ApplicationUncheckedCreateInput>
  }

  /**
   * Application createMany
   */
  export type ApplicationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Applications.
     */
    data: ApplicationCreateManyInput | ApplicationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Application createManyAndReturn
   */
  export type ApplicationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * The data used to create many Applications.
     */
    data: ApplicationCreateManyInput | ApplicationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Application update
   */
  export type ApplicationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * The data needed to update a Application.
     */
    data: XOR<ApplicationUpdateInput, ApplicationUncheckedUpdateInput>
    /**
     * Choose, which Application to update.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application updateMany
   */
  export type ApplicationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Applications.
     */
    data: XOR<ApplicationUpdateManyMutationInput, ApplicationUncheckedUpdateManyInput>
    /**
     * Filter which Applications to update
     */
    where?: ApplicationWhereInput
    /**
     * Limit how many Applications to update.
     */
    limit?: number
  }

  /**
   * Application updateManyAndReturn
   */
  export type ApplicationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * The data used to update Applications.
     */
    data: XOR<ApplicationUpdateManyMutationInput, ApplicationUncheckedUpdateManyInput>
    /**
     * Filter which Applications to update
     */
    where?: ApplicationWhereInput
    /**
     * Limit how many Applications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Application upsert
   */
  export type ApplicationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * The filter to search for the Application to update in case it exists.
     */
    where: ApplicationWhereUniqueInput
    /**
     * In case the Application found by the `where` argument doesn't exist, create a new Application with this data.
     */
    create: XOR<ApplicationCreateInput, ApplicationUncheckedCreateInput>
    /**
     * In case the Application was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApplicationUpdateInput, ApplicationUncheckedUpdateInput>
  }

  /**
   * Application delete
   */
  export type ApplicationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    /**
     * Filter which Application to delete.
     */
    where: ApplicationWhereUniqueInput
  }

  /**
   * Application deleteMany
   */
  export type ApplicationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Applications to delete
     */
    where?: ApplicationWhereInput
    /**
     * Limit how many Applications to delete.
     */
    limit?: number
  }

  /**
   * Application.aiChats
   */
  export type Application$aiChatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    where?: AiChatWhereInput
    orderBy?: AiChatOrderByWithRelationInput | AiChatOrderByWithRelationInput[]
    cursor?: AiChatWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AiChatScalarFieldEnum | AiChatScalarFieldEnum[]
  }

  /**
   * Application without action
   */
  export type ApplicationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
  }


  /**
   * Model AiChat
   */

  export type AggregateAiChat = {
    _count: AiChatCountAggregateOutputType | null
    _min: AiChatMinAggregateOutputType | null
    _max: AiChatMaxAggregateOutputType | null
  }

  export type AiChatMinAggregateOutputType = {
    id: string | null
    title: string | null
    context: $Enums.AiChatContext | null
    createdAt: Date | null
    updatedAt: Date | null
    organizationId: string | null
    userId: string | null
    applicationId: string | null
  }

  export type AiChatMaxAggregateOutputType = {
    id: string | null
    title: string | null
    context: $Enums.AiChatContext | null
    createdAt: Date | null
    updatedAt: Date | null
    organizationId: string | null
    userId: string | null
    applicationId: string | null
  }

  export type AiChatCountAggregateOutputType = {
    id: number
    title: number
    context: number
    createdAt: number
    updatedAt: number
    organizationId: number
    userId: number
    applicationId: number
    _all: number
  }


  export type AiChatMinAggregateInputType = {
    id?: true
    title?: true
    context?: true
    createdAt?: true
    updatedAt?: true
    organizationId?: true
    userId?: true
    applicationId?: true
  }

  export type AiChatMaxAggregateInputType = {
    id?: true
    title?: true
    context?: true
    createdAt?: true
    updatedAt?: true
    organizationId?: true
    userId?: true
    applicationId?: true
  }

  export type AiChatCountAggregateInputType = {
    id?: true
    title?: true
    context?: true
    createdAt?: true
    updatedAt?: true
    organizationId?: true
    userId?: true
    applicationId?: true
    _all?: true
  }

  export type AiChatAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AiChat to aggregate.
     */
    where?: AiChatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiChats to fetch.
     */
    orderBy?: AiChatOrderByWithRelationInput | AiChatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AiChatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiChats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiChats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AiChats
    **/
    _count?: true | AiChatCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AiChatMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AiChatMaxAggregateInputType
  }

  export type GetAiChatAggregateType<T extends AiChatAggregateArgs> = {
        [P in keyof T & keyof AggregateAiChat]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAiChat[P]>
      : GetScalarType<T[P], AggregateAiChat[P]>
  }




  export type AiChatGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AiChatWhereInput
    orderBy?: AiChatOrderByWithAggregationInput | AiChatOrderByWithAggregationInput[]
    by: AiChatScalarFieldEnum[] | AiChatScalarFieldEnum
    having?: AiChatScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AiChatCountAggregateInputType | true
    _min?: AiChatMinAggregateInputType
    _max?: AiChatMaxAggregateInputType
  }

  export type AiChatGroupByOutputType = {
    id: string
    title: string | null
    context: $Enums.AiChatContext
    createdAt: Date
    updatedAt: Date
    organizationId: string
    userId: string
    applicationId: string | null
    _count: AiChatCountAggregateOutputType | null
    _min: AiChatMinAggregateOutputType | null
    _max: AiChatMaxAggregateOutputType | null
  }

  type GetAiChatGroupByPayload<T extends AiChatGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AiChatGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AiChatGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AiChatGroupByOutputType[P]>
            : GetScalarType<T[P], AiChatGroupByOutputType[P]>
        }
      >
    >


  export type AiChatSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    context?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    userId?: boolean
    applicationId?: boolean
    messages?: boolean | AiChat$messagesArgs<ExtArgs>
    application?: boolean | AiChat$applicationArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    _count?: boolean | AiChatCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aiChat"]>

  export type AiChatSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    context?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    userId?: boolean
    applicationId?: boolean
    application?: boolean | AiChat$applicationArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aiChat"]>

  export type AiChatSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    context?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    userId?: boolean
    applicationId?: boolean
    application?: boolean | AiChat$applicationArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aiChat"]>

  export type AiChatSelectScalar = {
    id?: boolean
    title?: boolean
    context?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    organizationId?: boolean
    userId?: boolean
    applicationId?: boolean
  }

  export type AiChatOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "context" | "createdAt" | "updatedAt" | "organizationId" | "userId" | "applicationId", ExtArgs["result"]["aiChat"]>
  export type AiChatInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | AiChat$messagesArgs<ExtArgs>
    application?: boolean | AiChat$applicationArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
    _count?: boolean | AiChatCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AiChatIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    application?: boolean | AiChat$applicationArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }
  export type AiChatIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    application?: boolean | AiChat$applicationArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
    organization?: boolean | OrganizationDefaultArgs<ExtArgs>
  }

  export type $AiChatPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AiChat"
    objects: {
      messages: Prisma.$AiChatMessagePayload<ExtArgs>[]
      application: Prisma.$ApplicationPayload<ExtArgs> | null
      user: Prisma.$UserPayload<ExtArgs>
      organization: Prisma.$OrganizationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string | null
      context: $Enums.AiChatContext
      createdAt: Date
      updatedAt: Date
      organizationId: string
      userId: string
      applicationId: string | null
    }, ExtArgs["result"]["aiChat"]>
    composites: {}
  }

  type AiChatGetPayload<S extends boolean | null | undefined | AiChatDefaultArgs> = $Result.GetResult<Prisma.$AiChatPayload, S>

  type AiChatCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AiChatFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AiChatCountAggregateInputType | true
    }

  export interface AiChatDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AiChat'], meta: { name: 'AiChat' } }
    /**
     * Find zero or one AiChat that matches the filter.
     * @param {AiChatFindUniqueArgs} args - Arguments to find a AiChat
     * @example
     * // Get one AiChat
     * const aiChat = await prisma.aiChat.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AiChatFindUniqueArgs>(args: SelectSubset<T, AiChatFindUniqueArgs<ExtArgs>>): Prisma__AiChatClient<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AiChat that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AiChatFindUniqueOrThrowArgs} args - Arguments to find a AiChat
     * @example
     * // Get one AiChat
     * const aiChat = await prisma.aiChat.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AiChatFindUniqueOrThrowArgs>(args: SelectSubset<T, AiChatFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AiChatClient<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AiChat that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatFindFirstArgs} args - Arguments to find a AiChat
     * @example
     * // Get one AiChat
     * const aiChat = await prisma.aiChat.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AiChatFindFirstArgs>(args?: SelectSubset<T, AiChatFindFirstArgs<ExtArgs>>): Prisma__AiChatClient<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AiChat that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatFindFirstOrThrowArgs} args - Arguments to find a AiChat
     * @example
     * // Get one AiChat
     * const aiChat = await prisma.aiChat.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AiChatFindFirstOrThrowArgs>(args?: SelectSubset<T, AiChatFindFirstOrThrowArgs<ExtArgs>>): Prisma__AiChatClient<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AiChats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AiChats
     * const aiChats = await prisma.aiChat.findMany()
     * 
     * // Get first 10 AiChats
     * const aiChats = await prisma.aiChat.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aiChatWithIdOnly = await prisma.aiChat.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AiChatFindManyArgs>(args?: SelectSubset<T, AiChatFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AiChat.
     * @param {AiChatCreateArgs} args - Arguments to create a AiChat.
     * @example
     * // Create one AiChat
     * const AiChat = await prisma.aiChat.create({
     *   data: {
     *     // ... data to create a AiChat
     *   }
     * })
     * 
     */
    create<T extends AiChatCreateArgs>(args: SelectSubset<T, AiChatCreateArgs<ExtArgs>>): Prisma__AiChatClient<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AiChats.
     * @param {AiChatCreateManyArgs} args - Arguments to create many AiChats.
     * @example
     * // Create many AiChats
     * const aiChat = await prisma.aiChat.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AiChatCreateManyArgs>(args?: SelectSubset<T, AiChatCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AiChats and returns the data saved in the database.
     * @param {AiChatCreateManyAndReturnArgs} args - Arguments to create many AiChats.
     * @example
     * // Create many AiChats
     * const aiChat = await prisma.aiChat.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AiChats and only return the `id`
     * const aiChatWithIdOnly = await prisma.aiChat.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AiChatCreateManyAndReturnArgs>(args?: SelectSubset<T, AiChatCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AiChat.
     * @param {AiChatDeleteArgs} args - Arguments to delete one AiChat.
     * @example
     * // Delete one AiChat
     * const AiChat = await prisma.aiChat.delete({
     *   where: {
     *     // ... filter to delete one AiChat
     *   }
     * })
     * 
     */
    delete<T extends AiChatDeleteArgs>(args: SelectSubset<T, AiChatDeleteArgs<ExtArgs>>): Prisma__AiChatClient<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AiChat.
     * @param {AiChatUpdateArgs} args - Arguments to update one AiChat.
     * @example
     * // Update one AiChat
     * const aiChat = await prisma.aiChat.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AiChatUpdateArgs>(args: SelectSubset<T, AiChatUpdateArgs<ExtArgs>>): Prisma__AiChatClient<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AiChats.
     * @param {AiChatDeleteManyArgs} args - Arguments to filter AiChats to delete.
     * @example
     * // Delete a few AiChats
     * const { count } = await prisma.aiChat.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AiChatDeleteManyArgs>(args?: SelectSubset<T, AiChatDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AiChats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AiChats
     * const aiChat = await prisma.aiChat.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AiChatUpdateManyArgs>(args: SelectSubset<T, AiChatUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AiChats and returns the data updated in the database.
     * @param {AiChatUpdateManyAndReturnArgs} args - Arguments to update many AiChats.
     * @example
     * // Update many AiChats
     * const aiChat = await prisma.aiChat.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AiChats and only return the `id`
     * const aiChatWithIdOnly = await prisma.aiChat.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AiChatUpdateManyAndReturnArgs>(args: SelectSubset<T, AiChatUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AiChat.
     * @param {AiChatUpsertArgs} args - Arguments to update or create a AiChat.
     * @example
     * // Update or create a AiChat
     * const aiChat = await prisma.aiChat.upsert({
     *   create: {
     *     // ... data to create a AiChat
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AiChat we want to update
     *   }
     * })
     */
    upsert<T extends AiChatUpsertArgs>(args: SelectSubset<T, AiChatUpsertArgs<ExtArgs>>): Prisma__AiChatClient<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AiChats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatCountArgs} args - Arguments to filter AiChats to count.
     * @example
     * // Count the number of AiChats
     * const count = await prisma.aiChat.count({
     *   where: {
     *     // ... the filter for the AiChats we want to count
     *   }
     * })
    **/
    count<T extends AiChatCountArgs>(
      args?: Subset<T, AiChatCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AiChatCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AiChat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AiChatAggregateArgs>(args: Subset<T, AiChatAggregateArgs>): Prisma.PrismaPromise<GetAiChatAggregateType<T>>

    /**
     * Group by AiChat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AiChatGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AiChatGroupByArgs['orderBy'] }
        : { orderBy?: AiChatGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AiChatGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAiChatGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AiChat model
   */
  readonly fields: AiChatFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AiChat.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AiChatClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    messages<T extends AiChat$messagesArgs<ExtArgs> = {}>(args?: Subset<T, AiChat$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    application<T extends AiChat$applicationArgs<ExtArgs> = {}>(args?: Subset<T, AiChat$applicationArgs<ExtArgs>>): Prisma__ApplicationClient<$Result.GetResult<Prisma.$ApplicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    organization<T extends OrganizationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrganizationDefaultArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AiChat model
   */
  interface AiChatFieldRefs {
    readonly id: FieldRef<"AiChat", 'String'>
    readonly title: FieldRef<"AiChat", 'String'>
    readonly context: FieldRef<"AiChat", 'AiChatContext'>
    readonly createdAt: FieldRef<"AiChat", 'DateTime'>
    readonly updatedAt: FieldRef<"AiChat", 'DateTime'>
    readonly organizationId: FieldRef<"AiChat", 'String'>
    readonly userId: FieldRef<"AiChat", 'String'>
    readonly applicationId: FieldRef<"AiChat", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AiChat findUnique
   */
  export type AiChatFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    /**
     * Filter, which AiChat to fetch.
     */
    where: AiChatWhereUniqueInput
  }

  /**
   * AiChat findUniqueOrThrow
   */
  export type AiChatFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    /**
     * Filter, which AiChat to fetch.
     */
    where: AiChatWhereUniqueInput
  }

  /**
   * AiChat findFirst
   */
  export type AiChatFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    /**
     * Filter, which AiChat to fetch.
     */
    where?: AiChatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiChats to fetch.
     */
    orderBy?: AiChatOrderByWithRelationInput | AiChatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AiChats.
     */
    cursor?: AiChatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiChats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiChats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AiChats.
     */
    distinct?: AiChatScalarFieldEnum | AiChatScalarFieldEnum[]
  }

  /**
   * AiChat findFirstOrThrow
   */
  export type AiChatFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    /**
     * Filter, which AiChat to fetch.
     */
    where?: AiChatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiChats to fetch.
     */
    orderBy?: AiChatOrderByWithRelationInput | AiChatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AiChats.
     */
    cursor?: AiChatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiChats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiChats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AiChats.
     */
    distinct?: AiChatScalarFieldEnum | AiChatScalarFieldEnum[]
  }

  /**
   * AiChat findMany
   */
  export type AiChatFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    /**
     * Filter, which AiChats to fetch.
     */
    where?: AiChatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiChats to fetch.
     */
    orderBy?: AiChatOrderByWithRelationInput | AiChatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AiChats.
     */
    cursor?: AiChatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiChats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiChats.
     */
    skip?: number
    distinct?: AiChatScalarFieldEnum | AiChatScalarFieldEnum[]
  }

  /**
   * AiChat create
   */
  export type AiChatCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    /**
     * The data needed to create a AiChat.
     */
    data: XOR<AiChatCreateInput, AiChatUncheckedCreateInput>
  }

  /**
   * AiChat createMany
   */
  export type AiChatCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AiChats.
     */
    data: AiChatCreateManyInput | AiChatCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AiChat createManyAndReturn
   */
  export type AiChatCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * The data used to create many AiChats.
     */
    data: AiChatCreateManyInput | AiChatCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AiChat update
   */
  export type AiChatUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    /**
     * The data needed to update a AiChat.
     */
    data: XOR<AiChatUpdateInput, AiChatUncheckedUpdateInput>
    /**
     * Choose, which AiChat to update.
     */
    where: AiChatWhereUniqueInput
  }

  /**
   * AiChat updateMany
   */
  export type AiChatUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AiChats.
     */
    data: XOR<AiChatUpdateManyMutationInput, AiChatUncheckedUpdateManyInput>
    /**
     * Filter which AiChats to update
     */
    where?: AiChatWhereInput
    /**
     * Limit how many AiChats to update.
     */
    limit?: number
  }

  /**
   * AiChat updateManyAndReturn
   */
  export type AiChatUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * The data used to update AiChats.
     */
    data: XOR<AiChatUpdateManyMutationInput, AiChatUncheckedUpdateManyInput>
    /**
     * Filter which AiChats to update
     */
    where?: AiChatWhereInput
    /**
     * Limit how many AiChats to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AiChat upsert
   */
  export type AiChatUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    /**
     * The filter to search for the AiChat to update in case it exists.
     */
    where: AiChatWhereUniqueInput
    /**
     * In case the AiChat found by the `where` argument doesn't exist, create a new AiChat with this data.
     */
    create: XOR<AiChatCreateInput, AiChatUncheckedCreateInput>
    /**
     * In case the AiChat was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AiChatUpdateInput, AiChatUncheckedUpdateInput>
  }

  /**
   * AiChat delete
   */
  export type AiChatDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
    /**
     * Filter which AiChat to delete.
     */
    where: AiChatWhereUniqueInput
  }

  /**
   * AiChat deleteMany
   */
  export type AiChatDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AiChats to delete
     */
    where?: AiChatWhereInput
    /**
     * Limit how many AiChats to delete.
     */
    limit?: number
  }

  /**
   * AiChat.messages
   */
  export type AiChat$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    where?: AiChatMessageWhereInput
    orderBy?: AiChatMessageOrderByWithRelationInput | AiChatMessageOrderByWithRelationInput[]
    cursor?: AiChatMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AiChatMessageScalarFieldEnum | AiChatMessageScalarFieldEnum[]
  }

  /**
   * AiChat.application
   */
  export type AiChat$applicationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Application
     */
    select?: ApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Application
     */
    omit?: ApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApplicationInclude<ExtArgs> | null
    where?: ApplicationWhereInput
  }

  /**
   * AiChat without action
   */
  export type AiChatDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChat
     */
    select?: AiChatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChat
     */
    omit?: AiChatOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatInclude<ExtArgs> | null
  }


  /**
   * Model AiChatMessage
   */

  export type AggregateAiChatMessage = {
    _count: AiChatMessageCountAggregateOutputType | null
    _min: AiChatMessageMinAggregateOutputType | null
    _max: AiChatMessageMaxAggregateOutputType | null
  }

  export type AiChatMessageMinAggregateOutputType = {
    id: string | null
    role: $Enums.MessageRole | null
    content: string | null
    createdAt: Date | null
    chatId: string | null
  }

  export type AiChatMessageMaxAggregateOutputType = {
    id: string | null
    role: $Enums.MessageRole | null
    content: string | null
    createdAt: Date | null
    chatId: string | null
  }

  export type AiChatMessageCountAggregateOutputType = {
    id: number
    role: number
    content: number
    metadata: number
    createdAt: number
    chatId: number
    _all: number
  }


  export type AiChatMessageMinAggregateInputType = {
    id?: true
    role?: true
    content?: true
    createdAt?: true
    chatId?: true
  }

  export type AiChatMessageMaxAggregateInputType = {
    id?: true
    role?: true
    content?: true
    createdAt?: true
    chatId?: true
  }

  export type AiChatMessageCountAggregateInputType = {
    id?: true
    role?: true
    content?: true
    metadata?: true
    createdAt?: true
    chatId?: true
    _all?: true
  }

  export type AiChatMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AiChatMessage to aggregate.
     */
    where?: AiChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiChatMessages to fetch.
     */
    orderBy?: AiChatMessageOrderByWithRelationInput | AiChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AiChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AiChatMessages
    **/
    _count?: true | AiChatMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AiChatMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AiChatMessageMaxAggregateInputType
  }

  export type GetAiChatMessageAggregateType<T extends AiChatMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateAiChatMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAiChatMessage[P]>
      : GetScalarType<T[P], AggregateAiChatMessage[P]>
  }




  export type AiChatMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AiChatMessageWhereInput
    orderBy?: AiChatMessageOrderByWithAggregationInput | AiChatMessageOrderByWithAggregationInput[]
    by: AiChatMessageScalarFieldEnum[] | AiChatMessageScalarFieldEnum
    having?: AiChatMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AiChatMessageCountAggregateInputType | true
    _min?: AiChatMessageMinAggregateInputType
    _max?: AiChatMessageMaxAggregateInputType
  }

  export type AiChatMessageGroupByOutputType = {
    id: string
    role: $Enums.MessageRole
    content: string
    metadata: JsonValue | null
    createdAt: Date
    chatId: string
    _count: AiChatMessageCountAggregateOutputType | null
    _min: AiChatMessageMinAggregateOutputType | null
    _max: AiChatMessageMaxAggregateOutputType | null
  }

  type GetAiChatMessageGroupByPayload<T extends AiChatMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AiChatMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AiChatMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AiChatMessageGroupByOutputType[P]>
            : GetScalarType<T[P], AiChatMessageGroupByOutputType[P]>
        }
      >
    >


  export type AiChatMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    content?: boolean
    metadata?: boolean
    createdAt?: boolean
    chatId?: boolean
    chat?: boolean | AiChatDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aiChatMessage"]>

  export type AiChatMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    content?: boolean
    metadata?: boolean
    createdAt?: boolean
    chatId?: boolean
    chat?: boolean | AiChatDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aiChatMessage"]>

  export type AiChatMessageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    role?: boolean
    content?: boolean
    metadata?: boolean
    createdAt?: boolean
    chatId?: boolean
    chat?: boolean | AiChatDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["aiChatMessage"]>

  export type AiChatMessageSelectScalar = {
    id?: boolean
    role?: boolean
    content?: boolean
    metadata?: boolean
    createdAt?: boolean
    chatId?: boolean
  }

  export type AiChatMessageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "role" | "content" | "metadata" | "createdAt" | "chatId", ExtArgs["result"]["aiChatMessage"]>
  export type AiChatMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    chat?: boolean | AiChatDefaultArgs<ExtArgs>
  }
  export type AiChatMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    chat?: boolean | AiChatDefaultArgs<ExtArgs>
  }
  export type AiChatMessageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    chat?: boolean | AiChatDefaultArgs<ExtArgs>
  }

  export type $AiChatMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AiChatMessage"
    objects: {
      chat: Prisma.$AiChatPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      role: $Enums.MessageRole
      content: string
      metadata: Prisma.JsonValue | null
      createdAt: Date
      chatId: string
    }, ExtArgs["result"]["aiChatMessage"]>
    composites: {}
  }

  type AiChatMessageGetPayload<S extends boolean | null | undefined | AiChatMessageDefaultArgs> = $Result.GetResult<Prisma.$AiChatMessagePayload, S>

  type AiChatMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AiChatMessageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AiChatMessageCountAggregateInputType | true
    }

  export interface AiChatMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AiChatMessage'], meta: { name: 'AiChatMessage' } }
    /**
     * Find zero or one AiChatMessage that matches the filter.
     * @param {AiChatMessageFindUniqueArgs} args - Arguments to find a AiChatMessage
     * @example
     * // Get one AiChatMessage
     * const aiChatMessage = await prisma.aiChatMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AiChatMessageFindUniqueArgs>(args: SelectSubset<T, AiChatMessageFindUniqueArgs<ExtArgs>>): Prisma__AiChatMessageClient<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AiChatMessage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AiChatMessageFindUniqueOrThrowArgs} args - Arguments to find a AiChatMessage
     * @example
     * // Get one AiChatMessage
     * const aiChatMessage = await prisma.aiChatMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AiChatMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, AiChatMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AiChatMessageClient<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AiChatMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatMessageFindFirstArgs} args - Arguments to find a AiChatMessage
     * @example
     * // Get one AiChatMessage
     * const aiChatMessage = await prisma.aiChatMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AiChatMessageFindFirstArgs>(args?: SelectSubset<T, AiChatMessageFindFirstArgs<ExtArgs>>): Prisma__AiChatMessageClient<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AiChatMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatMessageFindFirstOrThrowArgs} args - Arguments to find a AiChatMessage
     * @example
     * // Get one AiChatMessage
     * const aiChatMessage = await prisma.aiChatMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AiChatMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, AiChatMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__AiChatMessageClient<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AiChatMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AiChatMessages
     * const aiChatMessages = await prisma.aiChatMessage.findMany()
     * 
     * // Get first 10 AiChatMessages
     * const aiChatMessages = await prisma.aiChatMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const aiChatMessageWithIdOnly = await prisma.aiChatMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AiChatMessageFindManyArgs>(args?: SelectSubset<T, AiChatMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AiChatMessage.
     * @param {AiChatMessageCreateArgs} args - Arguments to create a AiChatMessage.
     * @example
     * // Create one AiChatMessage
     * const AiChatMessage = await prisma.aiChatMessage.create({
     *   data: {
     *     // ... data to create a AiChatMessage
     *   }
     * })
     * 
     */
    create<T extends AiChatMessageCreateArgs>(args: SelectSubset<T, AiChatMessageCreateArgs<ExtArgs>>): Prisma__AiChatMessageClient<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AiChatMessages.
     * @param {AiChatMessageCreateManyArgs} args - Arguments to create many AiChatMessages.
     * @example
     * // Create many AiChatMessages
     * const aiChatMessage = await prisma.aiChatMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AiChatMessageCreateManyArgs>(args?: SelectSubset<T, AiChatMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AiChatMessages and returns the data saved in the database.
     * @param {AiChatMessageCreateManyAndReturnArgs} args - Arguments to create many AiChatMessages.
     * @example
     * // Create many AiChatMessages
     * const aiChatMessage = await prisma.aiChatMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AiChatMessages and only return the `id`
     * const aiChatMessageWithIdOnly = await prisma.aiChatMessage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AiChatMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, AiChatMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AiChatMessage.
     * @param {AiChatMessageDeleteArgs} args - Arguments to delete one AiChatMessage.
     * @example
     * // Delete one AiChatMessage
     * const AiChatMessage = await prisma.aiChatMessage.delete({
     *   where: {
     *     // ... filter to delete one AiChatMessage
     *   }
     * })
     * 
     */
    delete<T extends AiChatMessageDeleteArgs>(args: SelectSubset<T, AiChatMessageDeleteArgs<ExtArgs>>): Prisma__AiChatMessageClient<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AiChatMessage.
     * @param {AiChatMessageUpdateArgs} args - Arguments to update one AiChatMessage.
     * @example
     * // Update one AiChatMessage
     * const aiChatMessage = await prisma.aiChatMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AiChatMessageUpdateArgs>(args: SelectSubset<T, AiChatMessageUpdateArgs<ExtArgs>>): Prisma__AiChatMessageClient<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AiChatMessages.
     * @param {AiChatMessageDeleteManyArgs} args - Arguments to filter AiChatMessages to delete.
     * @example
     * // Delete a few AiChatMessages
     * const { count } = await prisma.aiChatMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AiChatMessageDeleteManyArgs>(args?: SelectSubset<T, AiChatMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AiChatMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AiChatMessages
     * const aiChatMessage = await prisma.aiChatMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AiChatMessageUpdateManyArgs>(args: SelectSubset<T, AiChatMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AiChatMessages and returns the data updated in the database.
     * @param {AiChatMessageUpdateManyAndReturnArgs} args - Arguments to update many AiChatMessages.
     * @example
     * // Update many AiChatMessages
     * const aiChatMessage = await prisma.aiChatMessage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AiChatMessages and only return the `id`
     * const aiChatMessageWithIdOnly = await prisma.aiChatMessage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AiChatMessageUpdateManyAndReturnArgs>(args: SelectSubset<T, AiChatMessageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AiChatMessage.
     * @param {AiChatMessageUpsertArgs} args - Arguments to update or create a AiChatMessage.
     * @example
     * // Update or create a AiChatMessage
     * const aiChatMessage = await prisma.aiChatMessage.upsert({
     *   create: {
     *     // ... data to create a AiChatMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AiChatMessage we want to update
     *   }
     * })
     */
    upsert<T extends AiChatMessageUpsertArgs>(args: SelectSubset<T, AiChatMessageUpsertArgs<ExtArgs>>): Prisma__AiChatMessageClient<$Result.GetResult<Prisma.$AiChatMessagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AiChatMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatMessageCountArgs} args - Arguments to filter AiChatMessages to count.
     * @example
     * // Count the number of AiChatMessages
     * const count = await prisma.aiChatMessage.count({
     *   where: {
     *     // ... the filter for the AiChatMessages we want to count
     *   }
     * })
    **/
    count<T extends AiChatMessageCountArgs>(
      args?: Subset<T, AiChatMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AiChatMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AiChatMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AiChatMessageAggregateArgs>(args: Subset<T, AiChatMessageAggregateArgs>): Prisma.PrismaPromise<GetAiChatMessageAggregateType<T>>

    /**
     * Group by AiChatMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AiChatMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AiChatMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AiChatMessageGroupByArgs['orderBy'] }
        : { orderBy?: AiChatMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AiChatMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAiChatMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AiChatMessage model
   */
  readonly fields: AiChatMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AiChatMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AiChatMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    chat<T extends AiChatDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AiChatDefaultArgs<ExtArgs>>): Prisma__AiChatClient<$Result.GetResult<Prisma.$AiChatPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AiChatMessage model
   */
  interface AiChatMessageFieldRefs {
    readonly id: FieldRef<"AiChatMessage", 'String'>
    readonly role: FieldRef<"AiChatMessage", 'MessageRole'>
    readonly content: FieldRef<"AiChatMessage", 'String'>
    readonly metadata: FieldRef<"AiChatMessage", 'Json'>
    readonly createdAt: FieldRef<"AiChatMessage", 'DateTime'>
    readonly chatId: FieldRef<"AiChatMessage", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AiChatMessage findUnique
   */
  export type AiChatMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which AiChatMessage to fetch.
     */
    where: AiChatMessageWhereUniqueInput
  }

  /**
   * AiChatMessage findUniqueOrThrow
   */
  export type AiChatMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which AiChatMessage to fetch.
     */
    where: AiChatMessageWhereUniqueInput
  }

  /**
   * AiChatMessage findFirst
   */
  export type AiChatMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which AiChatMessage to fetch.
     */
    where?: AiChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiChatMessages to fetch.
     */
    orderBy?: AiChatMessageOrderByWithRelationInput | AiChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AiChatMessages.
     */
    cursor?: AiChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AiChatMessages.
     */
    distinct?: AiChatMessageScalarFieldEnum | AiChatMessageScalarFieldEnum[]
  }

  /**
   * AiChatMessage findFirstOrThrow
   */
  export type AiChatMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which AiChatMessage to fetch.
     */
    where?: AiChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiChatMessages to fetch.
     */
    orderBy?: AiChatMessageOrderByWithRelationInput | AiChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AiChatMessages.
     */
    cursor?: AiChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiChatMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AiChatMessages.
     */
    distinct?: AiChatMessageScalarFieldEnum | AiChatMessageScalarFieldEnum[]
  }

  /**
   * AiChatMessage findMany
   */
  export type AiChatMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    /**
     * Filter, which AiChatMessages to fetch.
     */
    where?: AiChatMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AiChatMessages to fetch.
     */
    orderBy?: AiChatMessageOrderByWithRelationInput | AiChatMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AiChatMessages.
     */
    cursor?: AiChatMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AiChatMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AiChatMessages.
     */
    skip?: number
    distinct?: AiChatMessageScalarFieldEnum | AiChatMessageScalarFieldEnum[]
  }

  /**
   * AiChatMessage create
   */
  export type AiChatMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a AiChatMessage.
     */
    data: XOR<AiChatMessageCreateInput, AiChatMessageUncheckedCreateInput>
  }

  /**
   * AiChatMessage createMany
   */
  export type AiChatMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AiChatMessages.
     */
    data: AiChatMessageCreateManyInput | AiChatMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AiChatMessage createManyAndReturn
   */
  export type AiChatMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * The data used to create many AiChatMessages.
     */
    data: AiChatMessageCreateManyInput | AiChatMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AiChatMessage update
   */
  export type AiChatMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a AiChatMessage.
     */
    data: XOR<AiChatMessageUpdateInput, AiChatMessageUncheckedUpdateInput>
    /**
     * Choose, which AiChatMessage to update.
     */
    where: AiChatMessageWhereUniqueInput
  }

  /**
   * AiChatMessage updateMany
   */
  export type AiChatMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AiChatMessages.
     */
    data: XOR<AiChatMessageUpdateManyMutationInput, AiChatMessageUncheckedUpdateManyInput>
    /**
     * Filter which AiChatMessages to update
     */
    where?: AiChatMessageWhereInput
    /**
     * Limit how many AiChatMessages to update.
     */
    limit?: number
  }

  /**
   * AiChatMessage updateManyAndReturn
   */
  export type AiChatMessageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * The data used to update AiChatMessages.
     */
    data: XOR<AiChatMessageUpdateManyMutationInput, AiChatMessageUncheckedUpdateManyInput>
    /**
     * Filter which AiChatMessages to update
     */
    where?: AiChatMessageWhereInput
    /**
     * Limit how many AiChatMessages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AiChatMessage upsert
   */
  export type AiChatMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the AiChatMessage to update in case it exists.
     */
    where: AiChatMessageWhereUniqueInput
    /**
     * In case the AiChatMessage found by the `where` argument doesn't exist, create a new AiChatMessage with this data.
     */
    create: XOR<AiChatMessageCreateInput, AiChatMessageUncheckedCreateInput>
    /**
     * In case the AiChatMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AiChatMessageUpdateInput, AiChatMessageUncheckedUpdateInput>
  }

  /**
   * AiChatMessage delete
   */
  export type AiChatMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
    /**
     * Filter which AiChatMessage to delete.
     */
    where: AiChatMessageWhereUniqueInput
  }

  /**
   * AiChatMessage deleteMany
   */
  export type AiChatMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AiChatMessages to delete
     */
    where?: AiChatMessageWhereInput
    /**
     * Limit how many AiChatMessages to delete.
     */
    limit?: number
  }

  /**
   * AiChatMessage without action
   */
  export type AiChatMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AiChatMessage
     */
    select?: AiChatMessageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AiChatMessage
     */
    omit?: AiChatMessageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AiChatMessageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const Alembic_versionScalarFieldEnum: {
    version_num: 'version_num'
  };

  export type Alembic_versionScalarFieldEnum = (typeof Alembic_versionScalarFieldEnum)[keyof typeof Alembic_versionScalarFieldEnum]


  export const OpportunitiesScalarFieldEnum: {
    id: 'id',
    source: 'source',
    state_code: 'state_code',
    source_grant_id: 'source_grant_id',
    status: 'status',
    title: 'title',
    description: 'description',
    description_summary: 'description_summary',
    agency: 'agency',
    funding_instrument: 'funding_instrument',
    category: 'category',
    fiscal_year: 'fiscal_year',
    post_date: 'post_date',
    close_date: 'close_date',
    archive_date: 'archive_date',
    cost_sharing: 'cost_sharing',
    award_max: 'award_max',
    award_min: 'award_min',
    total_funding_amount: 'total_funding_amount',
    eligibility: 'eligibility',
    eligibility_summary: 'eligibility_summary',
    last_updated: 'last_updated',
    contact_name: 'contact_name',
    contact_email: 'contact_email',
    contact_phone: 'contact_phone',
    url: 'url',
    attachments: 'attachments',
    extra: 'extra',
    relevance_score: 'relevance_score'
  };

  export type OpportunitiesScalarFieldEnum = (typeof OpportunitiesScalarFieldEnum)[keyof typeof OpportunitiesScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    avatarUrl: 'avatarUrl',
    lastActiveAt: 'lastActiveAt',
    organizationId: 'organizationId',
    system_admin: 'system_admin'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const OrganizationScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    type: 'type',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    schoolDistrictId: 'schoolDistrictId'
  };

  export type OrganizationScalarFieldEnum = (typeof OrganizationScalarFieldEnum)[keyof typeof OrganizationScalarFieldEnum]


  export const SchoolDistrictScalarFieldEnum: {
    id: 'id',
    leaId: 'leaId',
    name: 'name',
    stateCode: 'stateCode',
    stateLeaId: 'stateLeaId',
    city: 'city',
    zipCode: 'zipCode',
    phone: 'phone',
    latitude: 'latitude',
    longitude: 'longitude',
    countyName: 'countyName',
    enrollment: 'enrollment',
    numberOfSchools: 'numberOfSchools',
    lowestGrade: 'lowestGrade',
    highestGrade: 'highestGrade',
    urbanCentricLocale: 'urbanCentricLocale',
    year: 'year'
  };

  export type SchoolDistrictScalarFieldEnum = (typeof SchoolDistrictScalarFieldEnum)[keyof typeof SchoolDistrictScalarFieldEnum]


  export const GrantBookmarkScalarFieldEnum: {
    id: 'id',
    notes: 'notes',
    createdAt: 'createdAt',
    organizationId: 'organizationId',
    userId: 'userId',
    opportunityId: 'opportunityId'
  };

  export type GrantBookmarkScalarFieldEnum = (typeof GrantBookmarkScalarFieldEnum)[keyof typeof GrantBookmarkScalarFieldEnum]


  export const GrantEligibilityAnalysisScalarFieldEnum: {
    id: 'id',
    matchScore: 'matchScore',
    goNoGo: 'goNoGo',
    rationale: 'rationale',
    risks: 'risks',
    confidence: 'confidence',
    createdAt: 'createdAt',
    organizationId: 'organizationId',
    opportunityId: 'opportunityId'
  };

  export type GrantEligibilityAnalysisScalarFieldEnum = (typeof GrantEligibilityAnalysisScalarFieldEnum)[keyof typeof GrantEligibilityAnalysisScalarFieldEnum]


  export const ApplicationScalarFieldEnum: {
    id: 'id',
    opportunityId: 'opportunityId',
    organizationId: 'organizationId',
    status: 'status',
    content: 'content',
    contentHtml: 'contentHtml',
    title: 'title',
    notes: 'notes',
    documents: 'documents',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    submittedAt: 'submittedAt',
    lastEditedAt: 'lastEditedAt'
  };

  export type ApplicationScalarFieldEnum = (typeof ApplicationScalarFieldEnum)[keyof typeof ApplicationScalarFieldEnum]


  export const AiChatScalarFieldEnum: {
    id: 'id',
    title: 'title',
    context: 'context',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    organizationId: 'organizationId',
    userId: 'userId',
    applicationId: 'applicationId'
  };

  export type AiChatScalarFieldEnum = (typeof AiChatScalarFieldEnum)[keyof typeof AiChatScalarFieldEnum]


  export const AiChatMessageScalarFieldEnum: {
    id: 'id',
    role: 'role',
    content: 'content',
    metadata: 'metadata',
    createdAt: 'createdAt',
    chatId: 'chatId'
  };

  export type AiChatMessageScalarFieldEnum = (typeof AiChatMessageScalarFieldEnum)[keyof typeof AiChatMessageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'opportunity_status_enum'
   */
  export type Enumopportunity_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'opportunity_status_enum'>
    


  /**
   * Reference to a field of type 'opportunity_status_enum[]'
   */
  export type ListEnumopportunity_status_enumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'opportunity_status_enum[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'OrganizationType'
   */
  export type EnumOrganizationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrganizationType'>
    


  /**
   * Reference to a field of type 'OrganizationType[]'
   */
  export type ListEnumOrganizationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrganizationType[]'>
    


  /**
   * Reference to a field of type 'OrganizationRole'
   */
  export type EnumOrganizationRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrganizationRole'>
    


  /**
   * Reference to a field of type 'OrganizationRole[]'
   */
  export type ListEnumOrganizationRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrganizationRole[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'GoNoGoDecision'
   */
  export type EnumGoNoGoDecisionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GoNoGoDecision'>
    


  /**
   * Reference to a field of type 'GoNoGoDecision[]'
   */
  export type ListEnumGoNoGoDecisionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GoNoGoDecision[]'>
    


  /**
   * Reference to a field of type 'ApplicationStatus'
   */
  export type EnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus'>
    


  /**
   * Reference to a field of type 'ApplicationStatus[]'
   */
  export type ListEnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus[]'>
    


  /**
   * Reference to a field of type 'AiChatContext'
   */
  export type EnumAiChatContextFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AiChatContext'>
    


  /**
   * Reference to a field of type 'AiChatContext[]'
   */
  export type ListEnumAiChatContextFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AiChatContext[]'>
    


  /**
   * Reference to a field of type 'MessageRole'
   */
  export type EnumMessageRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessageRole'>
    


  /**
   * Reference to a field of type 'MessageRole[]'
   */
  export type ListEnumMessageRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessageRole[]'>
    
  /**
   * Deep Input Types
   */


  export type alembic_versionWhereInput = {
    AND?: alembic_versionWhereInput | alembic_versionWhereInput[]
    OR?: alembic_versionWhereInput[]
    NOT?: alembic_versionWhereInput | alembic_versionWhereInput[]
    version_num?: StringFilter<"alembic_version"> | string
  }

  export type alembic_versionOrderByWithRelationInput = {
    version_num?: SortOrder
  }

  export type alembic_versionWhereUniqueInput = Prisma.AtLeast<{
    version_num?: string
    AND?: alembic_versionWhereInput | alembic_versionWhereInput[]
    OR?: alembic_versionWhereInput[]
    NOT?: alembic_versionWhereInput | alembic_versionWhereInput[]
  }, "version_num">

  export type alembic_versionOrderByWithAggregationInput = {
    version_num?: SortOrder
    _count?: alembic_versionCountOrderByAggregateInput
    _max?: alembic_versionMaxOrderByAggregateInput
    _min?: alembic_versionMinOrderByAggregateInput
  }

  export type alembic_versionScalarWhereWithAggregatesInput = {
    AND?: alembic_versionScalarWhereWithAggregatesInput | alembic_versionScalarWhereWithAggregatesInput[]
    OR?: alembic_versionScalarWhereWithAggregatesInput[]
    NOT?: alembic_versionScalarWhereWithAggregatesInput | alembic_versionScalarWhereWithAggregatesInput[]
    version_num?: StringWithAggregatesFilter<"alembic_version"> | string
  }

  export type opportunitiesWhereInput = {
    AND?: opportunitiesWhereInput | opportunitiesWhereInput[]
    OR?: opportunitiesWhereInput[]
    NOT?: opportunitiesWhereInput | opportunitiesWhereInput[]
    id?: IntFilter<"opportunities"> | number
    source?: StringFilter<"opportunities"> | string
    state_code?: StringNullableFilter<"opportunities"> | string | null
    source_grant_id?: StringFilter<"opportunities"> | string
    status?: Enumopportunity_status_enumFilter<"opportunities"> | $Enums.opportunity_status_enum
    title?: StringFilter<"opportunities"> | string
    description?: StringNullableFilter<"opportunities"> | string | null
    description_summary?: StringNullableFilter<"opportunities"> | string | null
    agency?: StringNullableFilter<"opportunities"> | string | null
    funding_instrument?: StringNullableFilter<"opportunities"> | string | null
    category?: StringNullableFilter<"opportunities"> | string | null
    fiscal_year?: IntNullableFilter<"opportunities"> | number | null
    post_date?: DateTimeNullableFilter<"opportunities"> | Date | string | null
    close_date?: DateTimeNullableFilter<"opportunities"> | Date | string | null
    archive_date?: DateTimeNullableFilter<"opportunities"> | Date | string | null
    cost_sharing?: BoolNullableFilter<"opportunities"> | boolean | null
    award_max?: IntNullableFilter<"opportunities"> | number | null
    award_min?: IntNullableFilter<"opportunities"> | number | null
    total_funding_amount?: IntNullableFilter<"opportunities"> | number | null
    eligibility?: StringNullableFilter<"opportunities"> | string | null
    eligibility_summary?: StringNullableFilter<"opportunities"> | string | null
    last_updated?: DateTimeNullableFilter<"opportunities"> | Date | string | null
    contact_name?: StringNullableFilter<"opportunities"> | string | null
    contact_email?: StringNullableFilter<"opportunities"> | string | null
    contact_phone?: StringNullableFilter<"opportunities"> | string | null
    url?: StringNullableFilter<"opportunities"> | string | null
    attachments?: JsonNullableFilter<"opportunities">
    extra?: JsonNullableFilter<"opportunities">
    relevance_score?: IntNullableFilter<"opportunities"> | number | null
  }

  export type opportunitiesOrderByWithRelationInput = {
    id?: SortOrder
    source?: SortOrder
    state_code?: SortOrderInput | SortOrder
    source_grant_id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    description_summary?: SortOrderInput | SortOrder
    agency?: SortOrderInput | SortOrder
    funding_instrument?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    fiscal_year?: SortOrderInput | SortOrder
    post_date?: SortOrderInput | SortOrder
    close_date?: SortOrderInput | SortOrder
    archive_date?: SortOrderInput | SortOrder
    cost_sharing?: SortOrderInput | SortOrder
    award_max?: SortOrderInput | SortOrder
    award_min?: SortOrderInput | SortOrder
    total_funding_amount?: SortOrderInput | SortOrder
    eligibility?: SortOrderInput | SortOrder
    eligibility_summary?: SortOrderInput | SortOrder
    last_updated?: SortOrderInput | SortOrder
    contact_name?: SortOrderInput | SortOrder
    contact_email?: SortOrderInput | SortOrder
    contact_phone?: SortOrderInput | SortOrder
    url?: SortOrderInput | SortOrder
    attachments?: SortOrderInput | SortOrder
    extra?: SortOrderInput | SortOrder
    relevance_score?: SortOrderInput | SortOrder
  }

  export type opportunitiesWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: opportunitiesWhereInput | opportunitiesWhereInput[]
    OR?: opportunitiesWhereInput[]
    NOT?: opportunitiesWhereInput | opportunitiesWhereInput[]
    source?: StringFilter<"opportunities"> | string
    state_code?: StringNullableFilter<"opportunities"> | string | null
    source_grant_id?: StringFilter<"opportunities"> | string
    status?: Enumopportunity_status_enumFilter<"opportunities"> | $Enums.opportunity_status_enum
    title?: StringFilter<"opportunities"> | string
    description?: StringNullableFilter<"opportunities"> | string | null
    description_summary?: StringNullableFilter<"opportunities"> | string | null
    agency?: StringNullableFilter<"opportunities"> | string | null
    funding_instrument?: StringNullableFilter<"opportunities"> | string | null
    category?: StringNullableFilter<"opportunities"> | string | null
    fiscal_year?: IntNullableFilter<"opportunities"> | number | null
    post_date?: DateTimeNullableFilter<"opportunities"> | Date | string | null
    close_date?: DateTimeNullableFilter<"opportunities"> | Date | string | null
    archive_date?: DateTimeNullableFilter<"opportunities"> | Date | string | null
    cost_sharing?: BoolNullableFilter<"opportunities"> | boolean | null
    award_max?: IntNullableFilter<"opportunities"> | number | null
    award_min?: IntNullableFilter<"opportunities"> | number | null
    total_funding_amount?: IntNullableFilter<"opportunities"> | number | null
    eligibility?: StringNullableFilter<"opportunities"> | string | null
    eligibility_summary?: StringNullableFilter<"opportunities"> | string | null
    last_updated?: DateTimeNullableFilter<"opportunities"> | Date | string | null
    contact_name?: StringNullableFilter<"opportunities"> | string | null
    contact_email?: StringNullableFilter<"opportunities"> | string | null
    contact_phone?: StringNullableFilter<"opportunities"> | string | null
    url?: StringNullableFilter<"opportunities"> | string | null
    attachments?: JsonNullableFilter<"opportunities">
    extra?: JsonNullableFilter<"opportunities">
    relevance_score?: IntNullableFilter<"opportunities"> | number | null
  }, "id">

  export type opportunitiesOrderByWithAggregationInput = {
    id?: SortOrder
    source?: SortOrder
    state_code?: SortOrderInput | SortOrder
    source_grant_id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    description_summary?: SortOrderInput | SortOrder
    agency?: SortOrderInput | SortOrder
    funding_instrument?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    fiscal_year?: SortOrderInput | SortOrder
    post_date?: SortOrderInput | SortOrder
    close_date?: SortOrderInput | SortOrder
    archive_date?: SortOrderInput | SortOrder
    cost_sharing?: SortOrderInput | SortOrder
    award_max?: SortOrderInput | SortOrder
    award_min?: SortOrderInput | SortOrder
    total_funding_amount?: SortOrderInput | SortOrder
    eligibility?: SortOrderInput | SortOrder
    eligibility_summary?: SortOrderInput | SortOrder
    last_updated?: SortOrderInput | SortOrder
    contact_name?: SortOrderInput | SortOrder
    contact_email?: SortOrderInput | SortOrder
    contact_phone?: SortOrderInput | SortOrder
    url?: SortOrderInput | SortOrder
    attachments?: SortOrderInput | SortOrder
    extra?: SortOrderInput | SortOrder
    relevance_score?: SortOrderInput | SortOrder
    _count?: opportunitiesCountOrderByAggregateInput
    _avg?: opportunitiesAvgOrderByAggregateInput
    _max?: opportunitiesMaxOrderByAggregateInput
    _min?: opportunitiesMinOrderByAggregateInput
    _sum?: opportunitiesSumOrderByAggregateInput
  }

  export type opportunitiesScalarWhereWithAggregatesInput = {
    AND?: opportunitiesScalarWhereWithAggregatesInput | opportunitiesScalarWhereWithAggregatesInput[]
    OR?: opportunitiesScalarWhereWithAggregatesInput[]
    NOT?: opportunitiesScalarWhereWithAggregatesInput | opportunitiesScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"opportunities"> | number
    source?: StringWithAggregatesFilter<"opportunities"> | string
    state_code?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    source_grant_id?: StringWithAggregatesFilter<"opportunities"> | string
    status?: Enumopportunity_status_enumWithAggregatesFilter<"opportunities"> | $Enums.opportunity_status_enum
    title?: StringWithAggregatesFilter<"opportunities"> | string
    description?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    description_summary?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    agency?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    funding_instrument?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    category?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    fiscal_year?: IntNullableWithAggregatesFilter<"opportunities"> | number | null
    post_date?: DateTimeNullableWithAggregatesFilter<"opportunities"> | Date | string | null
    close_date?: DateTimeNullableWithAggregatesFilter<"opportunities"> | Date | string | null
    archive_date?: DateTimeNullableWithAggregatesFilter<"opportunities"> | Date | string | null
    cost_sharing?: BoolNullableWithAggregatesFilter<"opportunities"> | boolean | null
    award_max?: IntNullableWithAggregatesFilter<"opportunities"> | number | null
    award_min?: IntNullableWithAggregatesFilter<"opportunities"> | number | null
    total_funding_amount?: IntNullableWithAggregatesFilter<"opportunities"> | number | null
    eligibility?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    eligibility_summary?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    last_updated?: DateTimeNullableWithAggregatesFilter<"opportunities"> | Date | string | null
    contact_name?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    contact_email?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    contact_phone?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    url?: StringNullableWithAggregatesFilter<"opportunities"> | string | null
    attachments?: JsonNullableWithAggregatesFilter<"opportunities">
    extra?: JsonNullableWithAggregatesFilter<"opportunities">
    relevance_score?: IntNullableWithAggregatesFilter<"opportunities"> | number | null
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    avatarUrl?: StringNullableFilter<"User"> | string | null
    lastActiveAt?: DateTimeFilter<"User"> | Date | string
    organizationId?: StringFilter<"User"> | string
    system_admin?: BoolFilter<"User"> | boolean
    aiChats?: AiChatListRelationFilter
    grantBookmarks?: GrantBookmarkListRelationFilter
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    lastActiveAt?: SortOrder
    organizationId?: SortOrder
    system_admin?: SortOrder
    aiChats?: AiChatOrderByRelationAggregateInput
    grantBookmarks?: GrantBookmarkOrderByRelationAggregateInput
    organization?: OrganizationOrderByWithRelationInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    organizationId?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    avatarUrl?: StringNullableFilter<"User"> | string | null
    lastActiveAt?: DateTimeFilter<"User"> | Date | string
    system_admin?: BoolFilter<"User"> | boolean
    aiChats?: AiChatListRelationFilter
    grantBookmarks?: GrantBookmarkListRelationFilter
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id" | "email" | "organizationId">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    lastActiveAt?: SortOrder
    organizationId?: SortOrder
    system_admin?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    avatarUrl?: StringNullableWithAggregatesFilter<"User"> | string | null
    lastActiveAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    organizationId?: StringWithAggregatesFilter<"User"> | string
    system_admin?: BoolWithAggregatesFilter<"User"> | boolean
  }

  export type OrganizationWhereInput = {
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    id?: StringFilter<"Organization"> | string
    name?: StringFilter<"Organization"> | string
    slug?: StringFilter<"Organization"> | string
    type?: EnumOrganizationTypeFilter<"Organization"> | $Enums.OrganizationType
    role?: EnumOrganizationRoleFilter<"Organization"> | $Enums.OrganizationRole
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    schoolDistrictId?: StringNullableFilter<"Organization"> | string | null
    aiChats?: AiChatListRelationFilter
    applications?: ApplicationListRelationFilter
    grantBookmarks?: GrantBookmarkListRelationFilter
    eligibilityAnalyses?: GrantEligibilityAnalysisListRelationFilter
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    schoolDistrict?: XOR<SchoolDistrictNullableScalarRelationFilter, SchoolDistrictWhereInput> | null
  }

  export type OrganizationOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schoolDistrictId?: SortOrderInput | SortOrder
    aiChats?: AiChatOrderByRelationAggregateInput
    applications?: ApplicationOrderByRelationAggregateInput
    grantBookmarks?: GrantBookmarkOrderByRelationAggregateInput
    eligibilityAnalyses?: GrantEligibilityAnalysisOrderByRelationAggregateInput
    user?: UserOrderByWithRelationInput
    schoolDistrict?: SchoolDistrictOrderByWithRelationInput
  }

  export type OrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    name?: StringFilter<"Organization"> | string
    type?: EnumOrganizationTypeFilter<"Organization"> | $Enums.OrganizationType
    role?: EnumOrganizationRoleFilter<"Organization"> | $Enums.OrganizationRole
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    schoolDistrictId?: StringNullableFilter<"Organization"> | string | null
    aiChats?: AiChatListRelationFilter
    applications?: ApplicationListRelationFilter
    grantBookmarks?: GrantBookmarkListRelationFilter
    eligibilityAnalyses?: GrantEligibilityAnalysisListRelationFilter
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    schoolDistrict?: XOR<SchoolDistrictNullableScalarRelationFilter, SchoolDistrictWhereInput> | null
  }, "id" | "slug">

  export type OrganizationOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schoolDistrictId?: SortOrderInput | SortOrder
    _count?: OrganizationCountOrderByAggregateInput
    _max?: OrganizationMaxOrderByAggregateInput
    _min?: OrganizationMinOrderByAggregateInput
  }

  export type OrganizationScalarWhereWithAggregatesInput = {
    AND?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    OR?: OrganizationScalarWhereWithAggregatesInput[]
    NOT?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Organization"> | string
    name?: StringWithAggregatesFilter<"Organization"> | string
    slug?: StringWithAggregatesFilter<"Organization"> | string
    type?: EnumOrganizationTypeWithAggregatesFilter<"Organization"> | $Enums.OrganizationType
    role?: EnumOrganizationRoleWithAggregatesFilter<"Organization"> | $Enums.OrganizationRole
    createdAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    schoolDistrictId?: StringNullableWithAggregatesFilter<"Organization"> | string | null
  }

  export type SchoolDistrictWhereInput = {
    AND?: SchoolDistrictWhereInput | SchoolDistrictWhereInput[]
    OR?: SchoolDistrictWhereInput[]
    NOT?: SchoolDistrictWhereInput | SchoolDistrictWhereInput[]
    id?: StringFilter<"SchoolDistrict"> | string
    leaId?: StringFilter<"SchoolDistrict"> | string
    name?: StringFilter<"SchoolDistrict"> | string
    stateCode?: StringFilter<"SchoolDistrict"> | string
    stateLeaId?: StringNullableFilter<"SchoolDistrict"> | string | null
    city?: StringNullableFilter<"SchoolDistrict"> | string | null
    zipCode?: StringNullableFilter<"SchoolDistrict"> | string | null
    phone?: StringNullableFilter<"SchoolDistrict"> | string | null
    latitude?: FloatNullableFilter<"SchoolDistrict"> | number | null
    longitude?: FloatNullableFilter<"SchoolDistrict"> | number | null
    countyName?: StringNullableFilter<"SchoolDistrict"> | string | null
    enrollment?: IntNullableFilter<"SchoolDistrict"> | number | null
    numberOfSchools?: IntNullableFilter<"SchoolDistrict"> | number | null
    lowestGrade?: IntNullableFilter<"SchoolDistrict"> | number | null
    highestGrade?: IntNullableFilter<"SchoolDistrict"> | number | null
    urbanCentricLocale?: IntNullableFilter<"SchoolDistrict"> | number | null
    year?: IntFilter<"SchoolDistrict"> | number
    organizations?: OrganizationListRelationFilter
  }

  export type SchoolDistrictOrderByWithRelationInput = {
    id?: SortOrder
    leaId?: SortOrder
    name?: SortOrder
    stateCode?: SortOrder
    stateLeaId?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    zipCode?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    countyName?: SortOrderInput | SortOrder
    enrollment?: SortOrderInput | SortOrder
    numberOfSchools?: SortOrderInput | SortOrder
    lowestGrade?: SortOrderInput | SortOrder
    highestGrade?: SortOrderInput | SortOrder
    urbanCentricLocale?: SortOrderInput | SortOrder
    year?: SortOrder
    organizations?: OrganizationOrderByRelationAggregateInput
  }

  export type SchoolDistrictWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    leaId?: string
    AND?: SchoolDistrictWhereInput | SchoolDistrictWhereInput[]
    OR?: SchoolDistrictWhereInput[]
    NOT?: SchoolDistrictWhereInput | SchoolDistrictWhereInput[]
    name?: StringFilter<"SchoolDistrict"> | string
    stateCode?: StringFilter<"SchoolDistrict"> | string
    stateLeaId?: StringNullableFilter<"SchoolDistrict"> | string | null
    city?: StringNullableFilter<"SchoolDistrict"> | string | null
    zipCode?: StringNullableFilter<"SchoolDistrict"> | string | null
    phone?: StringNullableFilter<"SchoolDistrict"> | string | null
    latitude?: FloatNullableFilter<"SchoolDistrict"> | number | null
    longitude?: FloatNullableFilter<"SchoolDistrict"> | number | null
    countyName?: StringNullableFilter<"SchoolDistrict"> | string | null
    enrollment?: IntNullableFilter<"SchoolDistrict"> | number | null
    numberOfSchools?: IntNullableFilter<"SchoolDistrict"> | number | null
    lowestGrade?: IntNullableFilter<"SchoolDistrict"> | number | null
    highestGrade?: IntNullableFilter<"SchoolDistrict"> | number | null
    urbanCentricLocale?: IntNullableFilter<"SchoolDistrict"> | number | null
    year?: IntFilter<"SchoolDistrict"> | number
    organizations?: OrganizationListRelationFilter
  }, "id" | "leaId">

  export type SchoolDistrictOrderByWithAggregationInput = {
    id?: SortOrder
    leaId?: SortOrder
    name?: SortOrder
    stateCode?: SortOrder
    stateLeaId?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    zipCode?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    latitude?: SortOrderInput | SortOrder
    longitude?: SortOrderInput | SortOrder
    countyName?: SortOrderInput | SortOrder
    enrollment?: SortOrderInput | SortOrder
    numberOfSchools?: SortOrderInput | SortOrder
    lowestGrade?: SortOrderInput | SortOrder
    highestGrade?: SortOrderInput | SortOrder
    urbanCentricLocale?: SortOrderInput | SortOrder
    year?: SortOrder
    _count?: SchoolDistrictCountOrderByAggregateInput
    _avg?: SchoolDistrictAvgOrderByAggregateInput
    _max?: SchoolDistrictMaxOrderByAggregateInput
    _min?: SchoolDistrictMinOrderByAggregateInput
    _sum?: SchoolDistrictSumOrderByAggregateInput
  }

  export type SchoolDistrictScalarWhereWithAggregatesInput = {
    AND?: SchoolDistrictScalarWhereWithAggregatesInput | SchoolDistrictScalarWhereWithAggregatesInput[]
    OR?: SchoolDistrictScalarWhereWithAggregatesInput[]
    NOT?: SchoolDistrictScalarWhereWithAggregatesInput | SchoolDistrictScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SchoolDistrict"> | string
    leaId?: StringWithAggregatesFilter<"SchoolDistrict"> | string
    name?: StringWithAggregatesFilter<"SchoolDistrict"> | string
    stateCode?: StringWithAggregatesFilter<"SchoolDistrict"> | string
    stateLeaId?: StringNullableWithAggregatesFilter<"SchoolDistrict"> | string | null
    city?: StringNullableWithAggregatesFilter<"SchoolDistrict"> | string | null
    zipCode?: StringNullableWithAggregatesFilter<"SchoolDistrict"> | string | null
    phone?: StringNullableWithAggregatesFilter<"SchoolDistrict"> | string | null
    latitude?: FloatNullableWithAggregatesFilter<"SchoolDistrict"> | number | null
    longitude?: FloatNullableWithAggregatesFilter<"SchoolDistrict"> | number | null
    countyName?: StringNullableWithAggregatesFilter<"SchoolDistrict"> | string | null
    enrollment?: IntNullableWithAggregatesFilter<"SchoolDistrict"> | number | null
    numberOfSchools?: IntNullableWithAggregatesFilter<"SchoolDistrict"> | number | null
    lowestGrade?: IntNullableWithAggregatesFilter<"SchoolDistrict"> | number | null
    highestGrade?: IntNullableWithAggregatesFilter<"SchoolDistrict"> | number | null
    urbanCentricLocale?: IntNullableWithAggregatesFilter<"SchoolDistrict"> | number | null
    year?: IntWithAggregatesFilter<"SchoolDistrict"> | number
  }

  export type GrantBookmarkWhereInput = {
    AND?: GrantBookmarkWhereInput | GrantBookmarkWhereInput[]
    OR?: GrantBookmarkWhereInput[]
    NOT?: GrantBookmarkWhereInput | GrantBookmarkWhereInput[]
    id?: StringFilter<"GrantBookmark"> | string
    notes?: StringNullableFilter<"GrantBookmark"> | string | null
    createdAt?: DateTimeFilter<"GrantBookmark"> | Date | string
    organizationId?: StringFilter<"GrantBookmark"> | string
    userId?: UuidFilter<"GrantBookmark"> | string
    opportunityId?: IntFilter<"GrantBookmark"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type GrantBookmarkOrderByWithRelationInput = {
    id?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    opportunityId?: SortOrder
    user?: UserOrderByWithRelationInput
    organization?: OrganizationOrderByWithRelationInput
  }

  export type GrantBookmarkWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_opportunityId_organizationId?: GrantBookmarkUserIdOpportunityIdOrganizationIdCompoundUniqueInput
    AND?: GrantBookmarkWhereInput | GrantBookmarkWhereInput[]
    OR?: GrantBookmarkWhereInput[]
    NOT?: GrantBookmarkWhereInput | GrantBookmarkWhereInput[]
    notes?: StringNullableFilter<"GrantBookmark"> | string | null
    createdAt?: DateTimeFilter<"GrantBookmark"> | Date | string
    organizationId?: StringFilter<"GrantBookmark"> | string
    userId?: UuidFilter<"GrantBookmark"> | string
    opportunityId?: IntFilter<"GrantBookmark"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id" | "userId_opportunityId_organizationId">

  export type GrantBookmarkOrderByWithAggregationInput = {
    id?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    opportunityId?: SortOrder
    _count?: GrantBookmarkCountOrderByAggregateInput
    _avg?: GrantBookmarkAvgOrderByAggregateInput
    _max?: GrantBookmarkMaxOrderByAggregateInput
    _min?: GrantBookmarkMinOrderByAggregateInput
    _sum?: GrantBookmarkSumOrderByAggregateInput
  }

  export type GrantBookmarkScalarWhereWithAggregatesInput = {
    AND?: GrantBookmarkScalarWhereWithAggregatesInput | GrantBookmarkScalarWhereWithAggregatesInput[]
    OR?: GrantBookmarkScalarWhereWithAggregatesInput[]
    NOT?: GrantBookmarkScalarWhereWithAggregatesInput | GrantBookmarkScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GrantBookmark"> | string
    notes?: StringNullableWithAggregatesFilter<"GrantBookmark"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"GrantBookmark"> | Date | string
    organizationId?: StringWithAggregatesFilter<"GrantBookmark"> | string
    userId?: UuidWithAggregatesFilter<"GrantBookmark"> | string
    opportunityId?: IntWithAggregatesFilter<"GrantBookmark"> | number
  }

  export type GrantEligibilityAnalysisWhereInput = {
    AND?: GrantEligibilityAnalysisWhereInput | GrantEligibilityAnalysisWhereInput[]
    OR?: GrantEligibilityAnalysisWhereInput[]
    NOT?: GrantEligibilityAnalysisWhereInput | GrantEligibilityAnalysisWhereInput[]
    id?: StringFilter<"GrantEligibilityAnalysis"> | string
    matchScore?: IntFilter<"GrantEligibilityAnalysis"> | number
    goNoGo?: EnumGoNoGoDecisionFilter<"GrantEligibilityAnalysis"> | $Enums.GoNoGoDecision
    rationale?: StringFilter<"GrantEligibilityAnalysis"> | string
    risks?: StringNullableFilter<"GrantEligibilityAnalysis"> | string | null
    confidence?: FloatNullableFilter<"GrantEligibilityAnalysis"> | number | null
    createdAt?: DateTimeFilter<"GrantEligibilityAnalysis"> | Date | string
    organizationId?: StringFilter<"GrantEligibilityAnalysis"> | string
    opportunityId?: IntFilter<"GrantEligibilityAnalysis"> | number
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type GrantEligibilityAnalysisOrderByWithRelationInput = {
    id?: SortOrder
    matchScore?: SortOrder
    goNoGo?: SortOrder
    rationale?: SortOrder
    risks?: SortOrderInput | SortOrder
    confidence?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    opportunityId?: SortOrder
    organization?: OrganizationOrderByWithRelationInput
  }

  export type GrantEligibilityAnalysisWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    opportunityId_organizationId?: GrantEligibilityAnalysisOpportunityIdOrganizationIdCompoundUniqueInput
    AND?: GrantEligibilityAnalysisWhereInput | GrantEligibilityAnalysisWhereInput[]
    OR?: GrantEligibilityAnalysisWhereInput[]
    NOT?: GrantEligibilityAnalysisWhereInput | GrantEligibilityAnalysisWhereInput[]
    matchScore?: IntFilter<"GrantEligibilityAnalysis"> | number
    goNoGo?: EnumGoNoGoDecisionFilter<"GrantEligibilityAnalysis"> | $Enums.GoNoGoDecision
    rationale?: StringFilter<"GrantEligibilityAnalysis"> | string
    risks?: StringNullableFilter<"GrantEligibilityAnalysis"> | string | null
    confidence?: FloatNullableFilter<"GrantEligibilityAnalysis"> | number | null
    createdAt?: DateTimeFilter<"GrantEligibilityAnalysis"> | Date | string
    organizationId?: StringFilter<"GrantEligibilityAnalysis"> | string
    opportunityId?: IntFilter<"GrantEligibilityAnalysis"> | number
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id" | "opportunityId_organizationId">

  export type GrantEligibilityAnalysisOrderByWithAggregationInput = {
    id?: SortOrder
    matchScore?: SortOrder
    goNoGo?: SortOrder
    rationale?: SortOrder
    risks?: SortOrderInput | SortOrder
    confidence?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    opportunityId?: SortOrder
    _count?: GrantEligibilityAnalysisCountOrderByAggregateInput
    _avg?: GrantEligibilityAnalysisAvgOrderByAggregateInput
    _max?: GrantEligibilityAnalysisMaxOrderByAggregateInput
    _min?: GrantEligibilityAnalysisMinOrderByAggregateInput
    _sum?: GrantEligibilityAnalysisSumOrderByAggregateInput
  }

  export type GrantEligibilityAnalysisScalarWhereWithAggregatesInput = {
    AND?: GrantEligibilityAnalysisScalarWhereWithAggregatesInput | GrantEligibilityAnalysisScalarWhereWithAggregatesInput[]
    OR?: GrantEligibilityAnalysisScalarWhereWithAggregatesInput[]
    NOT?: GrantEligibilityAnalysisScalarWhereWithAggregatesInput | GrantEligibilityAnalysisScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GrantEligibilityAnalysis"> | string
    matchScore?: IntWithAggregatesFilter<"GrantEligibilityAnalysis"> | number
    goNoGo?: EnumGoNoGoDecisionWithAggregatesFilter<"GrantEligibilityAnalysis"> | $Enums.GoNoGoDecision
    rationale?: StringWithAggregatesFilter<"GrantEligibilityAnalysis"> | string
    risks?: StringNullableWithAggregatesFilter<"GrantEligibilityAnalysis"> | string | null
    confidence?: FloatNullableWithAggregatesFilter<"GrantEligibilityAnalysis"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"GrantEligibilityAnalysis"> | Date | string
    organizationId?: StringWithAggregatesFilter<"GrantEligibilityAnalysis"> | string
    opportunityId?: IntWithAggregatesFilter<"GrantEligibilityAnalysis"> | number
  }

  export type ApplicationWhereInput = {
    AND?: ApplicationWhereInput | ApplicationWhereInput[]
    OR?: ApplicationWhereInput[]
    NOT?: ApplicationWhereInput | ApplicationWhereInput[]
    id?: StringFilter<"Application"> | string
    opportunityId?: IntFilter<"Application"> | number
    organizationId?: StringFilter<"Application"> | string
    status?: EnumApplicationStatusFilter<"Application"> | $Enums.ApplicationStatus
    content?: JsonNullableFilter<"Application">
    contentHtml?: StringNullableFilter<"Application"> | string | null
    title?: StringNullableFilter<"Application"> | string | null
    notes?: StringNullableFilter<"Application"> | string | null
    documents?: JsonNullableFilter<"Application">
    createdAt?: DateTimeFilter<"Application"> | Date | string
    updatedAt?: DateTimeFilter<"Application"> | Date | string
    submittedAt?: DateTimeNullableFilter<"Application"> | Date | string | null
    lastEditedAt?: DateTimeFilter<"Application"> | Date | string
    aiChats?: AiChatListRelationFilter
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type ApplicationOrderByWithRelationInput = {
    id?: SortOrder
    opportunityId?: SortOrder
    organizationId?: SortOrder
    status?: SortOrder
    content?: SortOrderInput | SortOrder
    contentHtml?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    documents?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    submittedAt?: SortOrderInput | SortOrder
    lastEditedAt?: SortOrder
    aiChats?: AiChatOrderByRelationAggregateInput
    organization?: OrganizationOrderByWithRelationInput
  }

  export type ApplicationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    opportunityId_organizationId?: ApplicationOpportunityIdOrganizationIdCompoundUniqueInput
    AND?: ApplicationWhereInput | ApplicationWhereInput[]
    OR?: ApplicationWhereInput[]
    NOT?: ApplicationWhereInput | ApplicationWhereInput[]
    opportunityId?: IntFilter<"Application"> | number
    organizationId?: StringFilter<"Application"> | string
    status?: EnumApplicationStatusFilter<"Application"> | $Enums.ApplicationStatus
    content?: JsonNullableFilter<"Application">
    contentHtml?: StringNullableFilter<"Application"> | string | null
    title?: StringNullableFilter<"Application"> | string | null
    notes?: StringNullableFilter<"Application"> | string | null
    documents?: JsonNullableFilter<"Application">
    createdAt?: DateTimeFilter<"Application"> | Date | string
    updatedAt?: DateTimeFilter<"Application"> | Date | string
    submittedAt?: DateTimeNullableFilter<"Application"> | Date | string | null
    lastEditedAt?: DateTimeFilter<"Application"> | Date | string
    aiChats?: AiChatListRelationFilter
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id" | "opportunityId_organizationId">

  export type ApplicationOrderByWithAggregationInput = {
    id?: SortOrder
    opportunityId?: SortOrder
    organizationId?: SortOrder
    status?: SortOrder
    content?: SortOrderInput | SortOrder
    contentHtml?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    documents?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    submittedAt?: SortOrderInput | SortOrder
    lastEditedAt?: SortOrder
    _count?: ApplicationCountOrderByAggregateInput
    _avg?: ApplicationAvgOrderByAggregateInput
    _max?: ApplicationMaxOrderByAggregateInput
    _min?: ApplicationMinOrderByAggregateInput
    _sum?: ApplicationSumOrderByAggregateInput
  }

  export type ApplicationScalarWhereWithAggregatesInput = {
    AND?: ApplicationScalarWhereWithAggregatesInput | ApplicationScalarWhereWithAggregatesInput[]
    OR?: ApplicationScalarWhereWithAggregatesInput[]
    NOT?: ApplicationScalarWhereWithAggregatesInput | ApplicationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Application"> | string
    opportunityId?: IntWithAggregatesFilter<"Application"> | number
    organizationId?: StringWithAggregatesFilter<"Application"> | string
    status?: EnumApplicationStatusWithAggregatesFilter<"Application"> | $Enums.ApplicationStatus
    content?: JsonNullableWithAggregatesFilter<"Application">
    contentHtml?: StringNullableWithAggregatesFilter<"Application"> | string | null
    title?: StringNullableWithAggregatesFilter<"Application"> | string | null
    notes?: StringNullableWithAggregatesFilter<"Application"> | string | null
    documents?: JsonNullableWithAggregatesFilter<"Application">
    createdAt?: DateTimeWithAggregatesFilter<"Application"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Application"> | Date | string
    submittedAt?: DateTimeNullableWithAggregatesFilter<"Application"> | Date | string | null
    lastEditedAt?: DateTimeWithAggregatesFilter<"Application"> | Date | string
  }

  export type AiChatWhereInput = {
    AND?: AiChatWhereInput | AiChatWhereInput[]
    OR?: AiChatWhereInput[]
    NOT?: AiChatWhereInput | AiChatWhereInput[]
    id?: StringFilter<"AiChat"> | string
    title?: StringNullableFilter<"AiChat"> | string | null
    context?: EnumAiChatContextFilter<"AiChat"> | $Enums.AiChatContext
    createdAt?: DateTimeFilter<"AiChat"> | Date | string
    updatedAt?: DateTimeFilter<"AiChat"> | Date | string
    organizationId?: StringFilter<"AiChat"> | string
    userId?: UuidFilter<"AiChat"> | string
    applicationId?: StringNullableFilter<"AiChat"> | string | null
    messages?: AiChatMessageListRelationFilter
    application?: XOR<ApplicationNullableScalarRelationFilter, ApplicationWhereInput> | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }

  export type AiChatOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrderInput | SortOrder
    context?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    messages?: AiChatMessageOrderByRelationAggregateInput
    application?: ApplicationOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
    organization?: OrganizationOrderByWithRelationInput
  }

  export type AiChatWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AiChatWhereInput | AiChatWhereInput[]
    OR?: AiChatWhereInput[]
    NOT?: AiChatWhereInput | AiChatWhereInput[]
    title?: StringNullableFilter<"AiChat"> | string | null
    context?: EnumAiChatContextFilter<"AiChat"> | $Enums.AiChatContext
    createdAt?: DateTimeFilter<"AiChat"> | Date | string
    updatedAt?: DateTimeFilter<"AiChat"> | Date | string
    organizationId?: StringFilter<"AiChat"> | string
    userId?: UuidFilter<"AiChat"> | string
    applicationId?: StringNullableFilter<"AiChat"> | string | null
    messages?: AiChatMessageListRelationFilter
    application?: XOR<ApplicationNullableScalarRelationFilter, ApplicationWhereInput> | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    organization?: XOR<OrganizationScalarRelationFilter, OrganizationWhereInput>
  }, "id">

  export type AiChatOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrderInput | SortOrder
    context?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrderInput | SortOrder
    _count?: AiChatCountOrderByAggregateInput
    _max?: AiChatMaxOrderByAggregateInput
    _min?: AiChatMinOrderByAggregateInput
  }

  export type AiChatScalarWhereWithAggregatesInput = {
    AND?: AiChatScalarWhereWithAggregatesInput | AiChatScalarWhereWithAggregatesInput[]
    OR?: AiChatScalarWhereWithAggregatesInput[]
    NOT?: AiChatScalarWhereWithAggregatesInput | AiChatScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AiChat"> | string
    title?: StringNullableWithAggregatesFilter<"AiChat"> | string | null
    context?: EnumAiChatContextWithAggregatesFilter<"AiChat"> | $Enums.AiChatContext
    createdAt?: DateTimeWithAggregatesFilter<"AiChat"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AiChat"> | Date | string
    organizationId?: StringWithAggregatesFilter<"AiChat"> | string
    userId?: UuidWithAggregatesFilter<"AiChat"> | string
    applicationId?: StringNullableWithAggregatesFilter<"AiChat"> | string | null
  }

  export type AiChatMessageWhereInput = {
    AND?: AiChatMessageWhereInput | AiChatMessageWhereInput[]
    OR?: AiChatMessageWhereInput[]
    NOT?: AiChatMessageWhereInput | AiChatMessageWhereInput[]
    id?: StringFilter<"AiChatMessage"> | string
    role?: EnumMessageRoleFilter<"AiChatMessage"> | $Enums.MessageRole
    content?: StringFilter<"AiChatMessage"> | string
    metadata?: JsonNullableFilter<"AiChatMessage">
    createdAt?: DateTimeFilter<"AiChatMessage"> | Date | string
    chatId?: StringFilter<"AiChatMessage"> | string
    chat?: XOR<AiChatScalarRelationFilter, AiChatWhereInput>
  }

  export type AiChatMessageOrderByWithRelationInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    chatId?: SortOrder
    chat?: AiChatOrderByWithRelationInput
  }

  export type AiChatMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AiChatMessageWhereInput | AiChatMessageWhereInput[]
    OR?: AiChatMessageWhereInput[]
    NOT?: AiChatMessageWhereInput | AiChatMessageWhereInput[]
    role?: EnumMessageRoleFilter<"AiChatMessage"> | $Enums.MessageRole
    content?: StringFilter<"AiChatMessage"> | string
    metadata?: JsonNullableFilter<"AiChatMessage">
    createdAt?: DateTimeFilter<"AiChatMessage"> | Date | string
    chatId?: StringFilter<"AiChatMessage"> | string
    chat?: XOR<AiChatScalarRelationFilter, AiChatWhereInput>
  }, "id">

  export type AiChatMessageOrderByWithAggregationInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    chatId?: SortOrder
    _count?: AiChatMessageCountOrderByAggregateInput
    _max?: AiChatMessageMaxOrderByAggregateInput
    _min?: AiChatMessageMinOrderByAggregateInput
  }

  export type AiChatMessageScalarWhereWithAggregatesInput = {
    AND?: AiChatMessageScalarWhereWithAggregatesInput | AiChatMessageScalarWhereWithAggregatesInput[]
    OR?: AiChatMessageScalarWhereWithAggregatesInput[]
    NOT?: AiChatMessageScalarWhereWithAggregatesInput | AiChatMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AiChatMessage"> | string
    role?: EnumMessageRoleWithAggregatesFilter<"AiChatMessage"> | $Enums.MessageRole
    content?: StringWithAggregatesFilter<"AiChatMessage"> | string
    metadata?: JsonNullableWithAggregatesFilter<"AiChatMessage">
    createdAt?: DateTimeWithAggregatesFilter<"AiChatMessage"> | Date | string
    chatId?: StringWithAggregatesFilter<"AiChatMessage"> | string
  }

  export type alembic_versionCreateInput = {
    version_num: string
  }

  export type alembic_versionUncheckedCreateInput = {
    version_num: string
  }

  export type alembic_versionUpdateInput = {
    version_num?: StringFieldUpdateOperationsInput | string
  }

  export type alembic_versionUncheckedUpdateInput = {
    version_num?: StringFieldUpdateOperationsInput | string
  }

  export type alembic_versionCreateManyInput = {
    version_num: string
  }

  export type alembic_versionUpdateManyMutationInput = {
    version_num?: StringFieldUpdateOperationsInput | string
  }

  export type alembic_versionUncheckedUpdateManyInput = {
    version_num?: StringFieldUpdateOperationsInput | string
  }

  export type opportunitiesCreateInput = {
    source: string
    state_code?: string | null
    source_grant_id: string
    status: $Enums.opportunity_status_enum
    title: string
    description?: string | null
    description_summary?: string | null
    agency?: string | null
    funding_instrument?: string | null
    category?: string | null
    fiscal_year?: number | null
    post_date?: Date | string | null
    close_date?: Date | string | null
    archive_date?: Date | string | null
    cost_sharing?: boolean | null
    award_max?: number | null
    award_min?: number | null
    total_funding_amount?: number | null
    eligibility?: string | null
    eligibility_summary?: string | null
    last_updated?: Date | string | null
    contact_name?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    url?: string | null
    attachments?: NullableJsonNullValueInput | InputJsonValue
    extra?: NullableJsonNullValueInput | InputJsonValue
    relevance_score?: number | null
  }

  export type opportunitiesUncheckedCreateInput = {
    id?: number
    source: string
    state_code?: string | null
    source_grant_id: string
    status: $Enums.opportunity_status_enum
    title: string
    description?: string | null
    description_summary?: string | null
    agency?: string | null
    funding_instrument?: string | null
    category?: string | null
    fiscal_year?: number | null
    post_date?: Date | string | null
    close_date?: Date | string | null
    archive_date?: Date | string | null
    cost_sharing?: boolean | null
    award_max?: number | null
    award_min?: number | null
    total_funding_amount?: number | null
    eligibility?: string | null
    eligibility_summary?: string | null
    last_updated?: Date | string | null
    contact_name?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    url?: string | null
    attachments?: NullableJsonNullValueInput | InputJsonValue
    extra?: NullableJsonNullValueInput | InputJsonValue
    relevance_score?: number | null
  }

  export type opportunitiesUpdateInput = {
    source?: StringFieldUpdateOperationsInput | string
    state_code?: NullableStringFieldUpdateOperationsInput | string | null
    source_grant_id?: StringFieldUpdateOperationsInput | string
    status?: Enumopportunity_status_enumFieldUpdateOperationsInput | $Enums.opportunity_status_enum
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    description_summary?: NullableStringFieldUpdateOperationsInput | string | null
    agency?: NullableStringFieldUpdateOperationsInput | string | null
    funding_instrument?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    fiscal_year?: NullableIntFieldUpdateOperationsInput | number | null
    post_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    close_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    archive_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cost_sharing?: NullableBoolFieldUpdateOperationsInput | boolean | null
    award_max?: NullableIntFieldUpdateOperationsInput | number | null
    award_min?: NullableIntFieldUpdateOperationsInput | number | null
    total_funding_amount?: NullableIntFieldUpdateOperationsInput | number | null
    eligibility?: NullableStringFieldUpdateOperationsInput | string | null
    eligibility_summary?: NullableStringFieldUpdateOperationsInput | string | null
    last_updated?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contact_name?: NullableStringFieldUpdateOperationsInput | string | null
    contact_email?: NullableStringFieldUpdateOperationsInput | string | null
    contact_phone?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: NullableJsonNullValueInput | InputJsonValue
    extra?: NullableJsonNullValueInput | InputJsonValue
    relevance_score?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type opportunitiesUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    state_code?: NullableStringFieldUpdateOperationsInput | string | null
    source_grant_id?: StringFieldUpdateOperationsInput | string
    status?: Enumopportunity_status_enumFieldUpdateOperationsInput | $Enums.opportunity_status_enum
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    description_summary?: NullableStringFieldUpdateOperationsInput | string | null
    agency?: NullableStringFieldUpdateOperationsInput | string | null
    funding_instrument?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    fiscal_year?: NullableIntFieldUpdateOperationsInput | number | null
    post_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    close_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    archive_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cost_sharing?: NullableBoolFieldUpdateOperationsInput | boolean | null
    award_max?: NullableIntFieldUpdateOperationsInput | number | null
    award_min?: NullableIntFieldUpdateOperationsInput | number | null
    total_funding_amount?: NullableIntFieldUpdateOperationsInput | number | null
    eligibility?: NullableStringFieldUpdateOperationsInput | string | null
    eligibility_summary?: NullableStringFieldUpdateOperationsInput | string | null
    last_updated?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contact_name?: NullableStringFieldUpdateOperationsInput | string | null
    contact_email?: NullableStringFieldUpdateOperationsInput | string | null
    contact_phone?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: NullableJsonNullValueInput | InputJsonValue
    extra?: NullableJsonNullValueInput | InputJsonValue
    relevance_score?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type opportunitiesCreateManyInput = {
    id?: number
    source: string
    state_code?: string | null
    source_grant_id: string
    status: $Enums.opportunity_status_enum
    title: string
    description?: string | null
    description_summary?: string | null
    agency?: string | null
    funding_instrument?: string | null
    category?: string | null
    fiscal_year?: number | null
    post_date?: Date | string | null
    close_date?: Date | string | null
    archive_date?: Date | string | null
    cost_sharing?: boolean | null
    award_max?: number | null
    award_min?: number | null
    total_funding_amount?: number | null
    eligibility?: string | null
    eligibility_summary?: string | null
    last_updated?: Date | string | null
    contact_name?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    url?: string | null
    attachments?: NullableJsonNullValueInput | InputJsonValue
    extra?: NullableJsonNullValueInput | InputJsonValue
    relevance_score?: number | null
  }

  export type opportunitiesUpdateManyMutationInput = {
    source?: StringFieldUpdateOperationsInput | string
    state_code?: NullableStringFieldUpdateOperationsInput | string | null
    source_grant_id?: StringFieldUpdateOperationsInput | string
    status?: Enumopportunity_status_enumFieldUpdateOperationsInput | $Enums.opportunity_status_enum
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    description_summary?: NullableStringFieldUpdateOperationsInput | string | null
    agency?: NullableStringFieldUpdateOperationsInput | string | null
    funding_instrument?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    fiscal_year?: NullableIntFieldUpdateOperationsInput | number | null
    post_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    close_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    archive_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cost_sharing?: NullableBoolFieldUpdateOperationsInput | boolean | null
    award_max?: NullableIntFieldUpdateOperationsInput | number | null
    award_min?: NullableIntFieldUpdateOperationsInput | number | null
    total_funding_amount?: NullableIntFieldUpdateOperationsInput | number | null
    eligibility?: NullableStringFieldUpdateOperationsInput | string | null
    eligibility_summary?: NullableStringFieldUpdateOperationsInput | string | null
    last_updated?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contact_name?: NullableStringFieldUpdateOperationsInput | string | null
    contact_email?: NullableStringFieldUpdateOperationsInput | string | null
    contact_phone?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: NullableJsonNullValueInput | InputJsonValue
    extra?: NullableJsonNullValueInput | InputJsonValue
    relevance_score?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type opportunitiesUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    source?: StringFieldUpdateOperationsInput | string
    state_code?: NullableStringFieldUpdateOperationsInput | string | null
    source_grant_id?: StringFieldUpdateOperationsInput | string
    status?: Enumopportunity_status_enumFieldUpdateOperationsInput | $Enums.opportunity_status_enum
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    description_summary?: NullableStringFieldUpdateOperationsInput | string | null
    agency?: NullableStringFieldUpdateOperationsInput | string | null
    funding_instrument?: NullableStringFieldUpdateOperationsInput | string | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    fiscal_year?: NullableIntFieldUpdateOperationsInput | number | null
    post_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    close_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    archive_date?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cost_sharing?: NullableBoolFieldUpdateOperationsInput | boolean | null
    award_max?: NullableIntFieldUpdateOperationsInput | number | null
    award_min?: NullableIntFieldUpdateOperationsInput | number | null
    total_funding_amount?: NullableIntFieldUpdateOperationsInput | number | null
    eligibility?: NullableStringFieldUpdateOperationsInput | string | null
    eligibility_summary?: NullableStringFieldUpdateOperationsInput | string | null
    last_updated?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contact_name?: NullableStringFieldUpdateOperationsInput | string | null
    contact_email?: NullableStringFieldUpdateOperationsInput | string | null
    contact_phone?: NullableStringFieldUpdateOperationsInput | string | null
    url?: NullableStringFieldUpdateOperationsInput | string | null
    attachments?: NullableJsonNullValueInput | InputJsonValue
    extra?: NullableJsonNullValueInput | InputJsonValue
    relevance_score?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type UserCreateInput = {
    id: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatarUrl?: string | null
    lastActiveAt?: Date | string
    system_admin?: boolean
    aiChats?: AiChatCreateNestedManyWithoutUserInput
    grantBookmarks?: GrantBookmarkCreateNestedManyWithoutUserInput
    organization: OrganizationCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatarUrl?: string | null
    lastActiveAt?: Date | string
    organizationId: string
    system_admin?: boolean
    aiChats?: AiChatUncheckedCreateNestedManyWithoutUserInput
    grantBookmarks?: GrantBookmarkUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
    aiChats?: AiChatUpdateManyWithoutUserNestedInput
    grantBookmarks?: GrantBookmarkUpdateManyWithoutUserNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
    aiChats?: AiChatUncheckedUpdateManyWithoutUserNestedInput
    grantBookmarks?: GrantBookmarkUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatarUrl?: string | null
    lastActiveAt?: Date | string
    organizationId: string
    system_admin?: boolean
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
  }

  export type OrganizationCreateInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    aiChats?: AiChatCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisCreateNestedManyWithoutOrganizationInput
    user?: UserCreateNestedOneWithoutOrganizationInput
    schoolDistrict?: SchoolDistrictCreateNestedOneWithoutOrganizationsInput
  }

  export type OrganizationUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    schoolDistrictId?: string | null
    aiChats?: AiChatUncheckedCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationUncheckedCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkUncheckedCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedCreateNestedManyWithoutOrganizationInput
    user?: UserUncheckedCreateNestedOneWithoutOrganizationInput
  }

  export type OrganizationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUpdateManyWithoutOrganizationNestedInput
    user?: UserUpdateOneWithoutOrganizationNestedInput
    schoolDistrict?: SchoolDistrictUpdateOneWithoutOrganizationsNestedInput
  }

  export type OrganizationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schoolDistrictId?: NullableStringFieldUpdateOperationsInput | string | null
    aiChats?: AiChatUncheckedUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUncheckedUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUncheckedUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedUpdateManyWithoutOrganizationNestedInput
    user?: UserUncheckedUpdateOneWithoutOrganizationNestedInput
  }

  export type OrganizationCreateManyInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    schoolDistrictId?: string | null
  }

  export type OrganizationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schoolDistrictId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SchoolDistrictCreateInput = {
    id?: string
    leaId: string
    name: string
    stateCode: string
    stateLeaId?: string | null
    city?: string | null
    zipCode?: string | null
    phone?: string | null
    latitude?: number | null
    longitude?: number | null
    countyName?: string | null
    enrollment?: number | null
    numberOfSchools?: number | null
    lowestGrade?: number | null
    highestGrade?: number | null
    urbanCentricLocale?: number | null
    year?: number
    organizations?: OrganizationCreateNestedManyWithoutSchoolDistrictInput
  }

  export type SchoolDistrictUncheckedCreateInput = {
    id?: string
    leaId: string
    name: string
    stateCode: string
    stateLeaId?: string | null
    city?: string | null
    zipCode?: string | null
    phone?: string | null
    latitude?: number | null
    longitude?: number | null
    countyName?: string | null
    enrollment?: number | null
    numberOfSchools?: number | null
    lowestGrade?: number | null
    highestGrade?: number | null
    urbanCentricLocale?: number | null
    year?: number
    organizations?: OrganizationUncheckedCreateNestedManyWithoutSchoolDistrictInput
  }

  export type SchoolDistrictUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    leaId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    stateCode?: StringFieldUpdateOperationsInput | string
    stateLeaId?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    countyName?: NullableStringFieldUpdateOperationsInput | string | null
    enrollment?: NullableIntFieldUpdateOperationsInput | number | null
    numberOfSchools?: NullableIntFieldUpdateOperationsInput | number | null
    lowestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    highestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    urbanCentricLocale?: NullableIntFieldUpdateOperationsInput | number | null
    year?: IntFieldUpdateOperationsInput | number
    organizations?: OrganizationUpdateManyWithoutSchoolDistrictNestedInput
  }

  export type SchoolDistrictUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    leaId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    stateCode?: StringFieldUpdateOperationsInput | string
    stateLeaId?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    countyName?: NullableStringFieldUpdateOperationsInput | string | null
    enrollment?: NullableIntFieldUpdateOperationsInput | number | null
    numberOfSchools?: NullableIntFieldUpdateOperationsInput | number | null
    lowestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    highestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    urbanCentricLocale?: NullableIntFieldUpdateOperationsInput | number | null
    year?: IntFieldUpdateOperationsInput | number
    organizations?: OrganizationUncheckedUpdateManyWithoutSchoolDistrictNestedInput
  }

  export type SchoolDistrictCreateManyInput = {
    id?: string
    leaId: string
    name: string
    stateCode: string
    stateLeaId?: string | null
    city?: string | null
    zipCode?: string | null
    phone?: string | null
    latitude?: number | null
    longitude?: number | null
    countyName?: string | null
    enrollment?: number | null
    numberOfSchools?: number | null
    lowestGrade?: number | null
    highestGrade?: number | null
    urbanCentricLocale?: number | null
    year?: number
  }

  export type SchoolDistrictUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    leaId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    stateCode?: StringFieldUpdateOperationsInput | string
    stateLeaId?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    countyName?: NullableStringFieldUpdateOperationsInput | string | null
    enrollment?: NullableIntFieldUpdateOperationsInput | number | null
    numberOfSchools?: NullableIntFieldUpdateOperationsInput | number | null
    lowestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    highestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    urbanCentricLocale?: NullableIntFieldUpdateOperationsInput | number | null
    year?: IntFieldUpdateOperationsInput | number
  }

  export type SchoolDistrictUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    leaId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    stateCode?: StringFieldUpdateOperationsInput | string
    stateLeaId?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    countyName?: NullableStringFieldUpdateOperationsInput | string | null
    enrollment?: NullableIntFieldUpdateOperationsInput | number | null
    numberOfSchools?: NullableIntFieldUpdateOperationsInput | number | null
    lowestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    highestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    urbanCentricLocale?: NullableIntFieldUpdateOperationsInput | number | null
    year?: IntFieldUpdateOperationsInput | number
  }

  export type GrantBookmarkCreateInput = {
    id?: string
    notes?: string | null
    createdAt?: Date | string
    opportunityId: number
    user: UserCreateNestedOneWithoutGrantBookmarksInput
    organization: OrganizationCreateNestedOneWithoutGrantBookmarksInput
  }

  export type GrantBookmarkUncheckedCreateInput = {
    id?: string
    notes?: string | null
    createdAt?: Date | string
    organizationId: string
    userId: string
    opportunityId: number
  }

  export type GrantBookmarkUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutGrantBookmarksNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutGrantBookmarksNestedInput
  }

  export type GrantBookmarkUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantBookmarkCreateManyInput = {
    id?: string
    notes?: string | null
    createdAt?: Date | string
    organizationId: string
    userId: string
    opportunityId: number
  }

  export type GrantBookmarkUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantBookmarkUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantEligibilityAnalysisCreateInput = {
    id?: string
    matchScore: number
    goNoGo: $Enums.GoNoGoDecision
    rationale: string
    risks?: string | null
    confidence?: number | null
    createdAt?: Date | string
    opportunityId: number
    organization: OrganizationCreateNestedOneWithoutEligibilityAnalysesInput
  }

  export type GrantEligibilityAnalysisUncheckedCreateInput = {
    id?: string
    matchScore: number
    goNoGo: $Enums.GoNoGoDecision
    rationale: string
    risks?: string | null
    confidence?: number | null
    createdAt?: Date | string
    organizationId: string
    opportunityId: number
  }

  export type GrantEligibilityAnalysisUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchScore?: IntFieldUpdateOperationsInput | number
    goNoGo?: EnumGoNoGoDecisionFieldUpdateOperationsInput | $Enums.GoNoGoDecision
    rationale?: StringFieldUpdateOperationsInput | string
    risks?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    organization?: OrganizationUpdateOneRequiredWithoutEligibilityAnalysesNestedInput
  }

  export type GrantEligibilityAnalysisUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchScore?: IntFieldUpdateOperationsInput | number
    goNoGo?: EnumGoNoGoDecisionFieldUpdateOperationsInput | $Enums.GoNoGoDecision
    rationale?: StringFieldUpdateOperationsInput | string
    risks?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantEligibilityAnalysisCreateManyInput = {
    id?: string
    matchScore: number
    goNoGo: $Enums.GoNoGoDecision
    rationale: string
    risks?: string | null
    confidence?: number | null
    createdAt?: Date | string
    organizationId: string
    opportunityId: number
  }

  export type GrantEligibilityAnalysisUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchScore?: IntFieldUpdateOperationsInput | number
    goNoGo?: EnumGoNoGoDecisionFieldUpdateOperationsInput | $Enums.GoNoGoDecision
    rationale?: StringFieldUpdateOperationsInput | string
    risks?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantEligibilityAnalysisUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchScore?: IntFieldUpdateOperationsInput | number
    goNoGo?: EnumGoNoGoDecisionFieldUpdateOperationsInput | $Enums.GoNoGoDecision
    rationale?: StringFieldUpdateOperationsInput | string
    risks?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type ApplicationCreateInput = {
    id?: string
    opportunityId: number
    status?: $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: string | null
    title?: string | null
    notes?: string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    submittedAt?: Date | string | null
    lastEditedAt?: Date | string
    aiChats?: AiChatCreateNestedManyWithoutApplicationInput
    organization: OrganizationCreateNestedOneWithoutApplicationsInput
  }

  export type ApplicationUncheckedCreateInput = {
    id?: string
    opportunityId: number
    organizationId: string
    status?: $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: string | null
    title?: string | null
    notes?: string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    submittedAt?: Date | string | null
    lastEditedAt?: Date | string
    aiChats?: AiChatUncheckedCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastEditedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUpdateManyWithoutApplicationNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutApplicationsNestedInput
  }

  export type ApplicationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    organizationId?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastEditedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUncheckedUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationCreateManyInput = {
    id?: string
    opportunityId: number
    organizationId: string
    status?: $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: string | null
    title?: string | null
    notes?: string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    submittedAt?: Date | string | null
    lastEditedAt?: Date | string
  }

  export type ApplicationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastEditedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApplicationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    organizationId?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastEditedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiChatCreateInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    messages?: AiChatMessageCreateNestedManyWithoutChatInput
    application?: ApplicationCreateNestedOneWithoutAiChatsInput
    user: UserCreateNestedOneWithoutAiChatsInput
    organization: OrganizationCreateNestedOneWithoutAiChatsInput
  }

  export type AiChatUncheckedCreateInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
    userId: string
    applicationId?: string | null
    messages?: AiChatMessageUncheckedCreateNestedManyWithoutChatInput
  }

  export type AiChatUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: AiChatMessageUpdateManyWithoutChatNestedInput
    application?: ApplicationUpdateOneWithoutAiChatsNestedInput
    user?: UserUpdateOneRequiredWithoutAiChatsNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutAiChatsNestedInput
  }

  export type AiChatUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    messages?: AiChatMessageUncheckedUpdateManyWithoutChatNestedInput
  }

  export type AiChatCreateManyInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
    userId: string
    applicationId?: string | null
  }

  export type AiChatUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiChatUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AiChatMessageCreateInput = {
    id?: string
    role: $Enums.MessageRole
    content: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    chat: AiChatCreateNestedOneWithoutMessagesInput
  }

  export type AiChatMessageUncheckedCreateInput = {
    id?: string
    role: $Enums.MessageRole
    content: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    chatId: string
  }

  export type AiChatMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMessageRoleFieldUpdateOperationsInput | $Enums.MessageRole
    content?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chat?: AiChatUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type AiChatMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMessageRoleFieldUpdateOperationsInput | $Enums.MessageRole
    content?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chatId?: StringFieldUpdateOperationsInput | string
  }

  export type AiChatMessageCreateManyInput = {
    id?: string
    role: $Enums.MessageRole
    content: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    chatId: string
  }

  export type AiChatMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMessageRoleFieldUpdateOperationsInput | $Enums.MessageRole
    content?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiChatMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMessageRoleFieldUpdateOperationsInput | $Enums.MessageRole
    content?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chatId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type alembic_versionCountOrderByAggregateInput = {
    version_num?: SortOrder
  }

  export type alembic_versionMaxOrderByAggregateInput = {
    version_num?: SortOrder
  }

  export type alembic_versionMinOrderByAggregateInput = {
    version_num?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type Enumopportunity_status_enumFilter<$PrismaModel = never> = {
    equals?: $Enums.opportunity_status_enum | Enumopportunity_status_enumFieldRefInput<$PrismaModel>
    in?: $Enums.opportunity_status_enum[] | ListEnumopportunity_status_enumFieldRefInput<$PrismaModel>
    notIn?: $Enums.opportunity_status_enum[] | ListEnumopportunity_status_enumFieldRefInput<$PrismaModel>
    not?: NestedEnumopportunity_status_enumFilter<$PrismaModel> | $Enums.opportunity_status_enum
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type opportunitiesCountOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    state_code?: SortOrder
    source_grant_id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    description?: SortOrder
    description_summary?: SortOrder
    agency?: SortOrder
    funding_instrument?: SortOrder
    category?: SortOrder
    fiscal_year?: SortOrder
    post_date?: SortOrder
    close_date?: SortOrder
    archive_date?: SortOrder
    cost_sharing?: SortOrder
    award_max?: SortOrder
    award_min?: SortOrder
    total_funding_amount?: SortOrder
    eligibility?: SortOrder
    eligibility_summary?: SortOrder
    last_updated?: SortOrder
    contact_name?: SortOrder
    contact_email?: SortOrder
    contact_phone?: SortOrder
    url?: SortOrder
    attachments?: SortOrder
    extra?: SortOrder
    relevance_score?: SortOrder
  }

  export type opportunitiesAvgOrderByAggregateInput = {
    id?: SortOrder
    fiscal_year?: SortOrder
    award_max?: SortOrder
    award_min?: SortOrder
    total_funding_amount?: SortOrder
    relevance_score?: SortOrder
  }

  export type opportunitiesMaxOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    state_code?: SortOrder
    source_grant_id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    description?: SortOrder
    description_summary?: SortOrder
    agency?: SortOrder
    funding_instrument?: SortOrder
    category?: SortOrder
    fiscal_year?: SortOrder
    post_date?: SortOrder
    close_date?: SortOrder
    archive_date?: SortOrder
    cost_sharing?: SortOrder
    award_max?: SortOrder
    award_min?: SortOrder
    total_funding_amount?: SortOrder
    eligibility?: SortOrder
    eligibility_summary?: SortOrder
    last_updated?: SortOrder
    contact_name?: SortOrder
    contact_email?: SortOrder
    contact_phone?: SortOrder
    url?: SortOrder
    relevance_score?: SortOrder
  }

  export type opportunitiesMinOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    state_code?: SortOrder
    source_grant_id?: SortOrder
    status?: SortOrder
    title?: SortOrder
    description?: SortOrder
    description_summary?: SortOrder
    agency?: SortOrder
    funding_instrument?: SortOrder
    category?: SortOrder
    fiscal_year?: SortOrder
    post_date?: SortOrder
    close_date?: SortOrder
    archive_date?: SortOrder
    cost_sharing?: SortOrder
    award_max?: SortOrder
    award_min?: SortOrder
    total_funding_amount?: SortOrder
    eligibility?: SortOrder
    eligibility_summary?: SortOrder
    last_updated?: SortOrder
    contact_name?: SortOrder
    contact_email?: SortOrder
    contact_phone?: SortOrder
    url?: SortOrder
    relevance_score?: SortOrder
  }

  export type opportunitiesSumOrderByAggregateInput = {
    id?: SortOrder
    fiscal_year?: SortOrder
    award_max?: SortOrder
    award_min?: SortOrder
    total_funding_amount?: SortOrder
    relevance_score?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type Enumopportunity_status_enumWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.opportunity_status_enum | Enumopportunity_status_enumFieldRefInput<$PrismaModel>
    in?: $Enums.opportunity_status_enum[] | ListEnumopportunity_status_enumFieldRefInput<$PrismaModel>
    notIn?: $Enums.opportunity_status_enum[] | ListEnumopportunity_status_enumFieldRefInput<$PrismaModel>
    not?: NestedEnumopportunity_status_enumWithAggregatesFilter<$PrismaModel> | $Enums.opportunity_status_enum
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumopportunity_status_enumFilter<$PrismaModel>
    _max?: NestedEnumopportunity_status_enumFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type AiChatListRelationFilter = {
    every?: AiChatWhereInput
    some?: AiChatWhereInput
    none?: AiChatWhereInput
  }

  export type GrantBookmarkListRelationFilter = {
    every?: GrantBookmarkWhereInput
    some?: GrantBookmarkWhereInput
    none?: GrantBookmarkWhereInput
  }

  export type OrganizationScalarRelationFilter = {
    is?: OrganizationWhereInput
    isNot?: OrganizationWhereInput
  }

  export type AiChatOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GrantBookmarkOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    avatarUrl?: SortOrder
    lastActiveAt?: SortOrder
    organizationId?: SortOrder
    system_admin?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    avatarUrl?: SortOrder
    lastActiveAt?: SortOrder
    organizationId?: SortOrder
    system_admin?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    avatarUrl?: SortOrder
    lastActiveAt?: SortOrder
    organizationId?: SortOrder
    system_admin?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumOrganizationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationType | EnumOrganizationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrganizationType[] | ListEnumOrganizationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrganizationType[] | ListEnumOrganizationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrganizationTypeFilter<$PrismaModel> | $Enums.OrganizationType
  }

  export type EnumOrganizationRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationRole | EnumOrganizationRoleFieldRefInput<$PrismaModel>
    in?: $Enums.OrganizationRole[] | ListEnumOrganizationRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrganizationRole[] | ListEnumOrganizationRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumOrganizationRoleFilter<$PrismaModel> | $Enums.OrganizationRole
  }

  export type ApplicationListRelationFilter = {
    every?: ApplicationWhereInput
    some?: ApplicationWhereInput
    none?: ApplicationWhereInput
  }

  export type GrantEligibilityAnalysisListRelationFilter = {
    every?: GrantEligibilityAnalysisWhereInput
    some?: GrantEligibilityAnalysisWhereInput
    none?: GrantEligibilityAnalysisWhereInput
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type SchoolDistrictNullableScalarRelationFilter = {
    is?: SchoolDistrictWhereInput | null
    isNot?: SchoolDistrictWhereInput | null
  }

  export type ApplicationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GrantEligibilityAnalysisOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrganizationCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schoolDistrictId?: SortOrder
  }

  export type OrganizationMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schoolDistrictId?: SortOrder
  }

  export type OrganizationMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schoolDistrictId?: SortOrder
  }

  export type EnumOrganizationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationType | EnumOrganizationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrganizationType[] | ListEnumOrganizationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrganizationType[] | ListEnumOrganizationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrganizationTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrganizationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrganizationTypeFilter<$PrismaModel>
    _max?: NestedEnumOrganizationTypeFilter<$PrismaModel>
  }

  export type EnumOrganizationRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationRole | EnumOrganizationRoleFieldRefInput<$PrismaModel>
    in?: $Enums.OrganizationRole[] | ListEnumOrganizationRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrganizationRole[] | ListEnumOrganizationRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumOrganizationRoleWithAggregatesFilter<$PrismaModel> | $Enums.OrganizationRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrganizationRoleFilter<$PrismaModel>
    _max?: NestedEnumOrganizationRoleFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type OrganizationListRelationFilter = {
    every?: OrganizationWhereInput
    some?: OrganizationWhereInput
    none?: OrganizationWhereInput
  }

  export type OrganizationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SchoolDistrictCountOrderByAggregateInput = {
    id?: SortOrder
    leaId?: SortOrder
    name?: SortOrder
    stateCode?: SortOrder
    stateLeaId?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    phone?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    countyName?: SortOrder
    enrollment?: SortOrder
    numberOfSchools?: SortOrder
    lowestGrade?: SortOrder
    highestGrade?: SortOrder
    urbanCentricLocale?: SortOrder
    year?: SortOrder
  }

  export type SchoolDistrictAvgOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    enrollment?: SortOrder
    numberOfSchools?: SortOrder
    lowestGrade?: SortOrder
    highestGrade?: SortOrder
    urbanCentricLocale?: SortOrder
    year?: SortOrder
  }

  export type SchoolDistrictMaxOrderByAggregateInput = {
    id?: SortOrder
    leaId?: SortOrder
    name?: SortOrder
    stateCode?: SortOrder
    stateLeaId?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    phone?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    countyName?: SortOrder
    enrollment?: SortOrder
    numberOfSchools?: SortOrder
    lowestGrade?: SortOrder
    highestGrade?: SortOrder
    urbanCentricLocale?: SortOrder
    year?: SortOrder
  }

  export type SchoolDistrictMinOrderByAggregateInput = {
    id?: SortOrder
    leaId?: SortOrder
    name?: SortOrder
    stateCode?: SortOrder
    stateLeaId?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    phone?: SortOrder
    latitude?: SortOrder
    longitude?: SortOrder
    countyName?: SortOrder
    enrollment?: SortOrder
    numberOfSchools?: SortOrder
    lowestGrade?: SortOrder
    highestGrade?: SortOrder
    urbanCentricLocale?: SortOrder
    year?: SortOrder
  }

  export type SchoolDistrictSumOrderByAggregateInput = {
    latitude?: SortOrder
    longitude?: SortOrder
    enrollment?: SortOrder
    numberOfSchools?: SortOrder
    lowestGrade?: SortOrder
    highestGrade?: SortOrder
    urbanCentricLocale?: SortOrder
    year?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type GrantBookmarkUserIdOpportunityIdOrganizationIdCompoundUniqueInput = {
    userId: string
    opportunityId: number
    organizationId: string
  }

  export type GrantBookmarkCountOrderByAggregateInput = {
    id?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    opportunityId?: SortOrder
  }

  export type GrantBookmarkAvgOrderByAggregateInput = {
    opportunityId?: SortOrder
  }

  export type GrantBookmarkMaxOrderByAggregateInput = {
    id?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    opportunityId?: SortOrder
  }

  export type GrantBookmarkMinOrderByAggregateInput = {
    id?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    opportunityId?: SortOrder
  }

  export type GrantBookmarkSumOrderByAggregateInput = {
    opportunityId?: SortOrder
  }

  export type EnumGoNoGoDecisionFilter<$PrismaModel = never> = {
    equals?: $Enums.GoNoGoDecision | EnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    in?: $Enums.GoNoGoDecision[] | ListEnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    notIn?: $Enums.GoNoGoDecision[] | ListEnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    not?: NestedEnumGoNoGoDecisionFilter<$PrismaModel> | $Enums.GoNoGoDecision
  }

  export type GrantEligibilityAnalysisOpportunityIdOrganizationIdCompoundUniqueInput = {
    opportunityId: number
    organizationId: string
  }

  export type GrantEligibilityAnalysisCountOrderByAggregateInput = {
    id?: SortOrder
    matchScore?: SortOrder
    goNoGo?: SortOrder
    rationale?: SortOrder
    risks?: SortOrder
    confidence?: SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    opportunityId?: SortOrder
  }

  export type GrantEligibilityAnalysisAvgOrderByAggregateInput = {
    matchScore?: SortOrder
    confidence?: SortOrder
    opportunityId?: SortOrder
  }

  export type GrantEligibilityAnalysisMaxOrderByAggregateInput = {
    id?: SortOrder
    matchScore?: SortOrder
    goNoGo?: SortOrder
    rationale?: SortOrder
    risks?: SortOrder
    confidence?: SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    opportunityId?: SortOrder
  }

  export type GrantEligibilityAnalysisMinOrderByAggregateInput = {
    id?: SortOrder
    matchScore?: SortOrder
    goNoGo?: SortOrder
    rationale?: SortOrder
    risks?: SortOrder
    confidence?: SortOrder
    createdAt?: SortOrder
    organizationId?: SortOrder
    opportunityId?: SortOrder
  }

  export type GrantEligibilityAnalysisSumOrderByAggregateInput = {
    matchScore?: SortOrder
    confidence?: SortOrder
    opportunityId?: SortOrder
  }

  export type EnumGoNoGoDecisionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GoNoGoDecision | EnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    in?: $Enums.GoNoGoDecision[] | ListEnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    notIn?: $Enums.GoNoGoDecision[] | ListEnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    not?: NestedEnumGoNoGoDecisionWithAggregatesFilter<$PrismaModel> | $Enums.GoNoGoDecision
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGoNoGoDecisionFilter<$PrismaModel>
    _max?: NestedEnumGoNoGoDecisionFilter<$PrismaModel>
  }

  export type EnumApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusFilter<$PrismaModel> | $Enums.ApplicationStatus
  }

  export type ApplicationOpportunityIdOrganizationIdCompoundUniqueInput = {
    opportunityId: number
    organizationId: string
  }

  export type ApplicationCountOrderByAggregateInput = {
    id?: SortOrder
    opportunityId?: SortOrder
    organizationId?: SortOrder
    status?: SortOrder
    content?: SortOrder
    contentHtml?: SortOrder
    title?: SortOrder
    notes?: SortOrder
    documents?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    submittedAt?: SortOrder
    lastEditedAt?: SortOrder
  }

  export type ApplicationAvgOrderByAggregateInput = {
    opportunityId?: SortOrder
  }

  export type ApplicationMaxOrderByAggregateInput = {
    id?: SortOrder
    opportunityId?: SortOrder
    organizationId?: SortOrder
    status?: SortOrder
    contentHtml?: SortOrder
    title?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    submittedAt?: SortOrder
    lastEditedAt?: SortOrder
  }

  export type ApplicationMinOrderByAggregateInput = {
    id?: SortOrder
    opportunityId?: SortOrder
    organizationId?: SortOrder
    status?: SortOrder
    contentHtml?: SortOrder
    title?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    submittedAt?: SortOrder
    lastEditedAt?: SortOrder
  }

  export type ApplicationSumOrderByAggregateInput = {
    opportunityId?: SortOrder
  }

  export type EnumApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumApplicationStatusFilter<$PrismaModel>
  }

  export type EnumAiChatContextFilter<$PrismaModel = never> = {
    equals?: $Enums.AiChatContext | EnumAiChatContextFieldRefInput<$PrismaModel>
    in?: $Enums.AiChatContext[] | ListEnumAiChatContextFieldRefInput<$PrismaModel>
    notIn?: $Enums.AiChatContext[] | ListEnumAiChatContextFieldRefInput<$PrismaModel>
    not?: NestedEnumAiChatContextFilter<$PrismaModel> | $Enums.AiChatContext
  }

  export type AiChatMessageListRelationFilter = {
    every?: AiChatMessageWhereInput
    some?: AiChatMessageWhereInput
    none?: AiChatMessageWhereInput
  }

  export type ApplicationNullableScalarRelationFilter = {
    is?: ApplicationWhereInput | null
    isNot?: ApplicationWhereInput | null
  }

  export type AiChatMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AiChatCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    context?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrder
  }

  export type AiChatMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    context?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrder
  }

  export type AiChatMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    context?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    organizationId?: SortOrder
    userId?: SortOrder
    applicationId?: SortOrder
  }

  export type EnumAiChatContextWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AiChatContext | EnumAiChatContextFieldRefInput<$PrismaModel>
    in?: $Enums.AiChatContext[] | ListEnumAiChatContextFieldRefInput<$PrismaModel>
    notIn?: $Enums.AiChatContext[] | ListEnumAiChatContextFieldRefInput<$PrismaModel>
    not?: NestedEnumAiChatContextWithAggregatesFilter<$PrismaModel> | $Enums.AiChatContext
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAiChatContextFilter<$PrismaModel>
    _max?: NestedEnumAiChatContextFilter<$PrismaModel>
  }

  export type EnumMessageRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageRole | EnumMessageRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MessageRole[] | ListEnumMessageRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageRole[] | ListEnumMessageRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageRoleFilter<$PrismaModel> | $Enums.MessageRole
  }

  export type AiChatScalarRelationFilter = {
    is?: AiChatWhereInput
    isNot?: AiChatWhereInput
  }

  export type AiChatMessageCountOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    chatId?: SortOrder
  }

  export type AiChatMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    chatId?: SortOrder
  }

  export type AiChatMessageMinOrderByAggregateInput = {
    id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    chatId?: SortOrder
  }

  export type EnumMessageRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageRole | EnumMessageRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MessageRole[] | ListEnumMessageRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageRole[] | ListEnumMessageRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageRoleWithAggregatesFilter<$PrismaModel> | $Enums.MessageRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMessageRoleFilter<$PrismaModel>
    _max?: NestedEnumMessageRoleFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type Enumopportunity_status_enumFieldUpdateOperationsInput = {
    set?: $Enums.opportunity_status_enum
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type AiChatCreateNestedManyWithoutUserInput = {
    create?: XOR<AiChatCreateWithoutUserInput, AiChatUncheckedCreateWithoutUserInput> | AiChatCreateWithoutUserInput[] | AiChatUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutUserInput | AiChatCreateOrConnectWithoutUserInput[]
    createMany?: AiChatCreateManyUserInputEnvelope
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
  }

  export type GrantBookmarkCreateNestedManyWithoutUserInput = {
    create?: XOR<GrantBookmarkCreateWithoutUserInput, GrantBookmarkUncheckedCreateWithoutUserInput> | GrantBookmarkCreateWithoutUserInput[] | GrantBookmarkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GrantBookmarkCreateOrConnectWithoutUserInput | GrantBookmarkCreateOrConnectWithoutUserInput[]
    createMany?: GrantBookmarkCreateManyUserInputEnvelope
    connect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
  }

  export type OrganizationCreateNestedOneWithoutUserInput = {
    create?: XOR<OrganizationCreateWithoutUserInput, OrganizationUncheckedCreateWithoutUserInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutUserInput
    connect?: OrganizationWhereUniqueInput
  }

  export type AiChatUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AiChatCreateWithoutUserInput, AiChatUncheckedCreateWithoutUserInput> | AiChatCreateWithoutUserInput[] | AiChatUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutUserInput | AiChatCreateOrConnectWithoutUserInput[]
    createMany?: AiChatCreateManyUserInputEnvelope
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
  }

  export type GrantBookmarkUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<GrantBookmarkCreateWithoutUserInput, GrantBookmarkUncheckedCreateWithoutUserInput> | GrantBookmarkCreateWithoutUserInput[] | GrantBookmarkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GrantBookmarkCreateOrConnectWithoutUserInput | GrantBookmarkCreateOrConnectWithoutUserInput[]
    createMany?: GrantBookmarkCreateManyUserInputEnvelope
    connect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type AiChatUpdateManyWithoutUserNestedInput = {
    create?: XOR<AiChatCreateWithoutUserInput, AiChatUncheckedCreateWithoutUserInput> | AiChatCreateWithoutUserInput[] | AiChatUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutUserInput | AiChatCreateOrConnectWithoutUserInput[]
    upsert?: AiChatUpsertWithWhereUniqueWithoutUserInput | AiChatUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AiChatCreateManyUserInputEnvelope
    set?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    disconnect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    delete?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    update?: AiChatUpdateWithWhereUniqueWithoutUserInput | AiChatUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AiChatUpdateManyWithWhereWithoutUserInput | AiChatUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AiChatScalarWhereInput | AiChatScalarWhereInput[]
  }

  export type GrantBookmarkUpdateManyWithoutUserNestedInput = {
    create?: XOR<GrantBookmarkCreateWithoutUserInput, GrantBookmarkUncheckedCreateWithoutUserInput> | GrantBookmarkCreateWithoutUserInput[] | GrantBookmarkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GrantBookmarkCreateOrConnectWithoutUserInput | GrantBookmarkCreateOrConnectWithoutUserInput[]
    upsert?: GrantBookmarkUpsertWithWhereUniqueWithoutUserInput | GrantBookmarkUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: GrantBookmarkCreateManyUserInputEnvelope
    set?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    disconnect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    delete?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    connect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    update?: GrantBookmarkUpdateWithWhereUniqueWithoutUserInput | GrantBookmarkUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: GrantBookmarkUpdateManyWithWhereWithoutUserInput | GrantBookmarkUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: GrantBookmarkScalarWhereInput | GrantBookmarkScalarWhereInput[]
  }

  export type OrganizationUpdateOneRequiredWithoutUserNestedInput = {
    create?: XOR<OrganizationCreateWithoutUserInput, OrganizationUncheckedCreateWithoutUserInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutUserInput
    upsert?: OrganizationUpsertWithoutUserInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutUserInput, OrganizationUpdateWithoutUserInput>, OrganizationUncheckedUpdateWithoutUserInput>
  }

  export type AiChatUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AiChatCreateWithoutUserInput, AiChatUncheckedCreateWithoutUserInput> | AiChatCreateWithoutUserInput[] | AiChatUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutUserInput | AiChatCreateOrConnectWithoutUserInput[]
    upsert?: AiChatUpsertWithWhereUniqueWithoutUserInput | AiChatUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AiChatCreateManyUserInputEnvelope
    set?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    disconnect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    delete?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    update?: AiChatUpdateWithWhereUniqueWithoutUserInput | AiChatUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AiChatUpdateManyWithWhereWithoutUserInput | AiChatUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AiChatScalarWhereInput | AiChatScalarWhereInput[]
  }

  export type GrantBookmarkUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<GrantBookmarkCreateWithoutUserInput, GrantBookmarkUncheckedCreateWithoutUserInput> | GrantBookmarkCreateWithoutUserInput[] | GrantBookmarkUncheckedCreateWithoutUserInput[]
    connectOrCreate?: GrantBookmarkCreateOrConnectWithoutUserInput | GrantBookmarkCreateOrConnectWithoutUserInput[]
    upsert?: GrantBookmarkUpsertWithWhereUniqueWithoutUserInput | GrantBookmarkUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: GrantBookmarkCreateManyUserInputEnvelope
    set?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    disconnect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    delete?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    connect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    update?: GrantBookmarkUpdateWithWhereUniqueWithoutUserInput | GrantBookmarkUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: GrantBookmarkUpdateManyWithWhereWithoutUserInput | GrantBookmarkUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: GrantBookmarkScalarWhereInput | GrantBookmarkScalarWhereInput[]
  }

  export type AiChatCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<AiChatCreateWithoutOrganizationInput, AiChatUncheckedCreateWithoutOrganizationInput> | AiChatCreateWithoutOrganizationInput[] | AiChatUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutOrganizationInput | AiChatCreateOrConnectWithoutOrganizationInput[]
    createMany?: AiChatCreateManyOrganizationInputEnvelope
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
  }

  export type ApplicationCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<ApplicationCreateWithoutOrganizationInput, ApplicationUncheckedCreateWithoutOrganizationInput> | ApplicationCreateWithoutOrganizationInput[] | ApplicationUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutOrganizationInput | ApplicationCreateOrConnectWithoutOrganizationInput[]
    createMany?: ApplicationCreateManyOrganizationInputEnvelope
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
  }

  export type GrantBookmarkCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<GrantBookmarkCreateWithoutOrganizationInput, GrantBookmarkUncheckedCreateWithoutOrganizationInput> | GrantBookmarkCreateWithoutOrganizationInput[] | GrantBookmarkUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: GrantBookmarkCreateOrConnectWithoutOrganizationInput | GrantBookmarkCreateOrConnectWithoutOrganizationInput[]
    createMany?: GrantBookmarkCreateManyOrganizationInputEnvelope
    connect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
  }

  export type GrantEligibilityAnalysisCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<GrantEligibilityAnalysisCreateWithoutOrganizationInput, GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput> | GrantEligibilityAnalysisCreateWithoutOrganizationInput[] | GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: GrantEligibilityAnalysisCreateOrConnectWithoutOrganizationInput | GrantEligibilityAnalysisCreateOrConnectWithoutOrganizationInput[]
    createMany?: GrantEligibilityAnalysisCreateManyOrganizationInputEnvelope
    connect?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutOrganizationInput = {
    create?: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrganizationInput
    connect?: UserWhereUniqueInput
  }

  export type SchoolDistrictCreateNestedOneWithoutOrganizationsInput = {
    create?: XOR<SchoolDistrictCreateWithoutOrganizationsInput, SchoolDistrictUncheckedCreateWithoutOrganizationsInput>
    connectOrCreate?: SchoolDistrictCreateOrConnectWithoutOrganizationsInput
    connect?: SchoolDistrictWhereUniqueInput
  }

  export type AiChatUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<AiChatCreateWithoutOrganizationInput, AiChatUncheckedCreateWithoutOrganizationInput> | AiChatCreateWithoutOrganizationInput[] | AiChatUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutOrganizationInput | AiChatCreateOrConnectWithoutOrganizationInput[]
    createMany?: AiChatCreateManyOrganizationInputEnvelope
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
  }

  export type ApplicationUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<ApplicationCreateWithoutOrganizationInput, ApplicationUncheckedCreateWithoutOrganizationInput> | ApplicationCreateWithoutOrganizationInput[] | ApplicationUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutOrganizationInput | ApplicationCreateOrConnectWithoutOrganizationInput[]
    createMany?: ApplicationCreateManyOrganizationInputEnvelope
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
  }

  export type GrantBookmarkUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<GrantBookmarkCreateWithoutOrganizationInput, GrantBookmarkUncheckedCreateWithoutOrganizationInput> | GrantBookmarkCreateWithoutOrganizationInput[] | GrantBookmarkUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: GrantBookmarkCreateOrConnectWithoutOrganizationInput | GrantBookmarkCreateOrConnectWithoutOrganizationInput[]
    createMany?: GrantBookmarkCreateManyOrganizationInputEnvelope
    connect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
  }

  export type GrantEligibilityAnalysisUncheckedCreateNestedManyWithoutOrganizationInput = {
    create?: XOR<GrantEligibilityAnalysisCreateWithoutOrganizationInput, GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput> | GrantEligibilityAnalysisCreateWithoutOrganizationInput[] | GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: GrantEligibilityAnalysisCreateOrConnectWithoutOrganizationInput | GrantEligibilityAnalysisCreateOrConnectWithoutOrganizationInput[]
    createMany?: GrantEligibilityAnalysisCreateManyOrganizationInputEnvelope
    connect?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedOneWithoutOrganizationInput = {
    create?: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrganizationInput
    connect?: UserWhereUniqueInput
  }

  export type EnumOrganizationTypeFieldUpdateOperationsInput = {
    set?: $Enums.OrganizationType
  }

  export type EnumOrganizationRoleFieldUpdateOperationsInput = {
    set?: $Enums.OrganizationRole
  }

  export type AiChatUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<AiChatCreateWithoutOrganizationInput, AiChatUncheckedCreateWithoutOrganizationInput> | AiChatCreateWithoutOrganizationInput[] | AiChatUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutOrganizationInput | AiChatCreateOrConnectWithoutOrganizationInput[]
    upsert?: AiChatUpsertWithWhereUniqueWithoutOrganizationInput | AiChatUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: AiChatCreateManyOrganizationInputEnvelope
    set?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    disconnect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    delete?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    update?: AiChatUpdateWithWhereUniqueWithoutOrganizationInput | AiChatUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: AiChatUpdateManyWithWhereWithoutOrganizationInput | AiChatUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: AiChatScalarWhereInput | AiChatScalarWhereInput[]
  }

  export type ApplicationUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<ApplicationCreateWithoutOrganizationInput, ApplicationUncheckedCreateWithoutOrganizationInput> | ApplicationCreateWithoutOrganizationInput[] | ApplicationUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutOrganizationInput | ApplicationCreateOrConnectWithoutOrganizationInput[]
    upsert?: ApplicationUpsertWithWhereUniqueWithoutOrganizationInput | ApplicationUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: ApplicationCreateManyOrganizationInputEnvelope
    set?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    disconnect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    delete?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    update?: ApplicationUpdateWithWhereUniqueWithoutOrganizationInput | ApplicationUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: ApplicationUpdateManyWithWhereWithoutOrganizationInput | ApplicationUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
  }

  export type GrantBookmarkUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<GrantBookmarkCreateWithoutOrganizationInput, GrantBookmarkUncheckedCreateWithoutOrganizationInput> | GrantBookmarkCreateWithoutOrganizationInput[] | GrantBookmarkUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: GrantBookmarkCreateOrConnectWithoutOrganizationInput | GrantBookmarkCreateOrConnectWithoutOrganizationInput[]
    upsert?: GrantBookmarkUpsertWithWhereUniqueWithoutOrganizationInput | GrantBookmarkUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: GrantBookmarkCreateManyOrganizationInputEnvelope
    set?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    disconnect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    delete?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    connect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    update?: GrantBookmarkUpdateWithWhereUniqueWithoutOrganizationInput | GrantBookmarkUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: GrantBookmarkUpdateManyWithWhereWithoutOrganizationInput | GrantBookmarkUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: GrantBookmarkScalarWhereInput | GrantBookmarkScalarWhereInput[]
  }

  export type GrantEligibilityAnalysisUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<GrantEligibilityAnalysisCreateWithoutOrganizationInput, GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput> | GrantEligibilityAnalysisCreateWithoutOrganizationInput[] | GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: GrantEligibilityAnalysisCreateOrConnectWithoutOrganizationInput | GrantEligibilityAnalysisCreateOrConnectWithoutOrganizationInput[]
    upsert?: GrantEligibilityAnalysisUpsertWithWhereUniqueWithoutOrganizationInput | GrantEligibilityAnalysisUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: GrantEligibilityAnalysisCreateManyOrganizationInputEnvelope
    set?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
    disconnect?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
    delete?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
    connect?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
    update?: GrantEligibilityAnalysisUpdateWithWhereUniqueWithoutOrganizationInput | GrantEligibilityAnalysisUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: GrantEligibilityAnalysisUpdateManyWithWhereWithoutOrganizationInput | GrantEligibilityAnalysisUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: GrantEligibilityAnalysisScalarWhereInput | GrantEligibilityAnalysisScalarWhereInput[]
  }

  export type UserUpdateOneWithoutOrganizationNestedInput = {
    create?: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrganizationInput
    upsert?: UserUpsertWithoutOrganizationInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOrganizationInput, UserUpdateWithoutOrganizationInput>, UserUncheckedUpdateWithoutOrganizationInput>
  }

  export type SchoolDistrictUpdateOneWithoutOrganizationsNestedInput = {
    create?: XOR<SchoolDistrictCreateWithoutOrganizationsInput, SchoolDistrictUncheckedCreateWithoutOrganizationsInput>
    connectOrCreate?: SchoolDistrictCreateOrConnectWithoutOrganizationsInput
    upsert?: SchoolDistrictUpsertWithoutOrganizationsInput
    disconnect?: SchoolDistrictWhereInput | boolean
    delete?: SchoolDistrictWhereInput | boolean
    connect?: SchoolDistrictWhereUniqueInput
    update?: XOR<XOR<SchoolDistrictUpdateToOneWithWhereWithoutOrganizationsInput, SchoolDistrictUpdateWithoutOrganizationsInput>, SchoolDistrictUncheckedUpdateWithoutOrganizationsInput>
  }

  export type AiChatUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<AiChatCreateWithoutOrganizationInput, AiChatUncheckedCreateWithoutOrganizationInput> | AiChatCreateWithoutOrganizationInput[] | AiChatUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutOrganizationInput | AiChatCreateOrConnectWithoutOrganizationInput[]
    upsert?: AiChatUpsertWithWhereUniqueWithoutOrganizationInput | AiChatUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: AiChatCreateManyOrganizationInputEnvelope
    set?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    disconnect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    delete?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    update?: AiChatUpdateWithWhereUniqueWithoutOrganizationInput | AiChatUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: AiChatUpdateManyWithWhereWithoutOrganizationInput | AiChatUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: AiChatScalarWhereInput | AiChatScalarWhereInput[]
  }

  export type ApplicationUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<ApplicationCreateWithoutOrganizationInput, ApplicationUncheckedCreateWithoutOrganizationInput> | ApplicationCreateWithoutOrganizationInput[] | ApplicationUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: ApplicationCreateOrConnectWithoutOrganizationInput | ApplicationCreateOrConnectWithoutOrganizationInput[]
    upsert?: ApplicationUpsertWithWhereUniqueWithoutOrganizationInput | ApplicationUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: ApplicationCreateManyOrganizationInputEnvelope
    set?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    disconnect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    delete?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    connect?: ApplicationWhereUniqueInput | ApplicationWhereUniqueInput[]
    update?: ApplicationUpdateWithWhereUniqueWithoutOrganizationInput | ApplicationUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: ApplicationUpdateManyWithWhereWithoutOrganizationInput | ApplicationUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
  }

  export type GrantBookmarkUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<GrantBookmarkCreateWithoutOrganizationInput, GrantBookmarkUncheckedCreateWithoutOrganizationInput> | GrantBookmarkCreateWithoutOrganizationInput[] | GrantBookmarkUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: GrantBookmarkCreateOrConnectWithoutOrganizationInput | GrantBookmarkCreateOrConnectWithoutOrganizationInput[]
    upsert?: GrantBookmarkUpsertWithWhereUniqueWithoutOrganizationInput | GrantBookmarkUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: GrantBookmarkCreateManyOrganizationInputEnvelope
    set?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    disconnect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    delete?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    connect?: GrantBookmarkWhereUniqueInput | GrantBookmarkWhereUniqueInput[]
    update?: GrantBookmarkUpdateWithWhereUniqueWithoutOrganizationInput | GrantBookmarkUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: GrantBookmarkUpdateManyWithWhereWithoutOrganizationInput | GrantBookmarkUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: GrantBookmarkScalarWhereInput | GrantBookmarkScalarWhereInput[]
  }

  export type GrantEligibilityAnalysisUncheckedUpdateManyWithoutOrganizationNestedInput = {
    create?: XOR<GrantEligibilityAnalysisCreateWithoutOrganizationInput, GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput> | GrantEligibilityAnalysisCreateWithoutOrganizationInput[] | GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput[]
    connectOrCreate?: GrantEligibilityAnalysisCreateOrConnectWithoutOrganizationInput | GrantEligibilityAnalysisCreateOrConnectWithoutOrganizationInput[]
    upsert?: GrantEligibilityAnalysisUpsertWithWhereUniqueWithoutOrganizationInput | GrantEligibilityAnalysisUpsertWithWhereUniqueWithoutOrganizationInput[]
    createMany?: GrantEligibilityAnalysisCreateManyOrganizationInputEnvelope
    set?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
    disconnect?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
    delete?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
    connect?: GrantEligibilityAnalysisWhereUniqueInput | GrantEligibilityAnalysisWhereUniqueInput[]
    update?: GrantEligibilityAnalysisUpdateWithWhereUniqueWithoutOrganizationInput | GrantEligibilityAnalysisUpdateWithWhereUniqueWithoutOrganizationInput[]
    updateMany?: GrantEligibilityAnalysisUpdateManyWithWhereWithoutOrganizationInput | GrantEligibilityAnalysisUpdateManyWithWhereWithoutOrganizationInput[]
    deleteMany?: GrantEligibilityAnalysisScalarWhereInput | GrantEligibilityAnalysisScalarWhereInput[]
  }

  export type UserUncheckedUpdateOneWithoutOrganizationNestedInput = {
    create?: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrganizationInput
    upsert?: UserUpsertWithoutOrganizationInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOrganizationInput, UserUpdateWithoutOrganizationInput>, UserUncheckedUpdateWithoutOrganizationInput>
  }

  export type OrganizationCreateNestedManyWithoutSchoolDistrictInput = {
    create?: XOR<OrganizationCreateWithoutSchoolDistrictInput, OrganizationUncheckedCreateWithoutSchoolDistrictInput> | OrganizationCreateWithoutSchoolDistrictInput[] | OrganizationUncheckedCreateWithoutSchoolDistrictInput[]
    connectOrCreate?: OrganizationCreateOrConnectWithoutSchoolDistrictInput | OrganizationCreateOrConnectWithoutSchoolDistrictInput[]
    createMany?: OrganizationCreateManySchoolDistrictInputEnvelope
    connect?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
  }

  export type OrganizationUncheckedCreateNestedManyWithoutSchoolDistrictInput = {
    create?: XOR<OrganizationCreateWithoutSchoolDistrictInput, OrganizationUncheckedCreateWithoutSchoolDistrictInput> | OrganizationCreateWithoutSchoolDistrictInput[] | OrganizationUncheckedCreateWithoutSchoolDistrictInput[]
    connectOrCreate?: OrganizationCreateOrConnectWithoutSchoolDistrictInput | OrganizationCreateOrConnectWithoutSchoolDistrictInput[]
    createMany?: OrganizationCreateManySchoolDistrictInputEnvelope
    connect?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OrganizationUpdateManyWithoutSchoolDistrictNestedInput = {
    create?: XOR<OrganizationCreateWithoutSchoolDistrictInput, OrganizationUncheckedCreateWithoutSchoolDistrictInput> | OrganizationCreateWithoutSchoolDistrictInput[] | OrganizationUncheckedCreateWithoutSchoolDistrictInput[]
    connectOrCreate?: OrganizationCreateOrConnectWithoutSchoolDistrictInput | OrganizationCreateOrConnectWithoutSchoolDistrictInput[]
    upsert?: OrganizationUpsertWithWhereUniqueWithoutSchoolDistrictInput | OrganizationUpsertWithWhereUniqueWithoutSchoolDistrictInput[]
    createMany?: OrganizationCreateManySchoolDistrictInputEnvelope
    set?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
    disconnect?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
    delete?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
    connect?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
    update?: OrganizationUpdateWithWhereUniqueWithoutSchoolDistrictInput | OrganizationUpdateWithWhereUniqueWithoutSchoolDistrictInput[]
    updateMany?: OrganizationUpdateManyWithWhereWithoutSchoolDistrictInput | OrganizationUpdateManyWithWhereWithoutSchoolDistrictInput[]
    deleteMany?: OrganizationScalarWhereInput | OrganizationScalarWhereInput[]
  }

  export type OrganizationUncheckedUpdateManyWithoutSchoolDistrictNestedInput = {
    create?: XOR<OrganizationCreateWithoutSchoolDistrictInput, OrganizationUncheckedCreateWithoutSchoolDistrictInput> | OrganizationCreateWithoutSchoolDistrictInput[] | OrganizationUncheckedCreateWithoutSchoolDistrictInput[]
    connectOrCreate?: OrganizationCreateOrConnectWithoutSchoolDistrictInput | OrganizationCreateOrConnectWithoutSchoolDistrictInput[]
    upsert?: OrganizationUpsertWithWhereUniqueWithoutSchoolDistrictInput | OrganizationUpsertWithWhereUniqueWithoutSchoolDistrictInput[]
    createMany?: OrganizationCreateManySchoolDistrictInputEnvelope
    set?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
    disconnect?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
    delete?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
    connect?: OrganizationWhereUniqueInput | OrganizationWhereUniqueInput[]
    update?: OrganizationUpdateWithWhereUniqueWithoutSchoolDistrictInput | OrganizationUpdateWithWhereUniqueWithoutSchoolDistrictInput[]
    updateMany?: OrganizationUpdateManyWithWhereWithoutSchoolDistrictInput | OrganizationUpdateManyWithWhereWithoutSchoolDistrictInput[]
    deleteMany?: OrganizationScalarWhereInput | OrganizationScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutGrantBookmarksInput = {
    create?: XOR<UserCreateWithoutGrantBookmarksInput, UserUncheckedCreateWithoutGrantBookmarksInput>
    connectOrCreate?: UserCreateOrConnectWithoutGrantBookmarksInput
    connect?: UserWhereUniqueInput
  }

  export type OrganizationCreateNestedOneWithoutGrantBookmarksInput = {
    create?: XOR<OrganizationCreateWithoutGrantBookmarksInput, OrganizationUncheckedCreateWithoutGrantBookmarksInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutGrantBookmarksInput
    connect?: OrganizationWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutGrantBookmarksNestedInput = {
    create?: XOR<UserCreateWithoutGrantBookmarksInput, UserUncheckedCreateWithoutGrantBookmarksInput>
    connectOrCreate?: UserCreateOrConnectWithoutGrantBookmarksInput
    upsert?: UserUpsertWithoutGrantBookmarksInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutGrantBookmarksInput, UserUpdateWithoutGrantBookmarksInput>, UserUncheckedUpdateWithoutGrantBookmarksInput>
  }

  export type OrganizationUpdateOneRequiredWithoutGrantBookmarksNestedInput = {
    create?: XOR<OrganizationCreateWithoutGrantBookmarksInput, OrganizationUncheckedCreateWithoutGrantBookmarksInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutGrantBookmarksInput
    upsert?: OrganizationUpsertWithoutGrantBookmarksInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutGrantBookmarksInput, OrganizationUpdateWithoutGrantBookmarksInput>, OrganizationUncheckedUpdateWithoutGrantBookmarksInput>
  }

  export type OrganizationCreateNestedOneWithoutEligibilityAnalysesInput = {
    create?: XOR<OrganizationCreateWithoutEligibilityAnalysesInput, OrganizationUncheckedCreateWithoutEligibilityAnalysesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutEligibilityAnalysesInput
    connect?: OrganizationWhereUniqueInput
  }

  export type EnumGoNoGoDecisionFieldUpdateOperationsInput = {
    set?: $Enums.GoNoGoDecision
  }

  export type OrganizationUpdateOneRequiredWithoutEligibilityAnalysesNestedInput = {
    create?: XOR<OrganizationCreateWithoutEligibilityAnalysesInput, OrganizationUncheckedCreateWithoutEligibilityAnalysesInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutEligibilityAnalysesInput
    upsert?: OrganizationUpsertWithoutEligibilityAnalysesInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutEligibilityAnalysesInput, OrganizationUpdateWithoutEligibilityAnalysesInput>, OrganizationUncheckedUpdateWithoutEligibilityAnalysesInput>
  }

  export type AiChatCreateNestedManyWithoutApplicationInput = {
    create?: XOR<AiChatCreateWithoutApplicationInput, AiChatUncheckedCreateWithoutApplicationInput> | AiChatCreateWithoutApplicationInput[] | AiChatUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutApplicationInput | AiChatCreateOrConnectWithoutApplicationInput[]
    createMany?: AiChatCreateManyApplicationInputEnvelope
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
  }

  export type OrganizationCreateNestedOneWithoutApplicationsInput = {
    create?: XOR<OrganizationCreateWithoutApplicationsInput, OrganizationUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutApplicationsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type AiChatUncheckedCreateNestedManyWithoutApplicationInput = {
    create?: XOR<AiChatCreateWithoutApplicationInput, AiChatUncheckedCreateWithoutApplicationInput> | AiChatCreateWithoutApplicationInput[] | AiChatUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutApplicationInput | AiChatCreateOrConnectWithoutApplicationInput[]
    createMany?: AiChatCreateManyApplicationInputEnvelope
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
  }

  export type EnumApplicationStatusFieldUpdateOperationsInput = {
    set?: $Enums.ApplicationStatus
  }

  export type AiChatUpdateManyWithoutApplicationNestedInput = {
    create?: XOR<AiChatCreateWithoutApplicationInput, AiChatUncheckedCreateWithoutApplicationInput> | AiChatCreateWithoutApplicationInput[] | AiChatUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutApplicationInput | AiChatCreateOrConnectWithoutApplicationInput[]
    upsert?: AiChatUpsertWithWhereUniqueWithoutApplicationInput | AiChatUpsertWithWhereUniqueWithoutApplicationInput[]
    createMany?: AiChatCreateManyApplicationInputEnvelope
    set?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    disconnect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    delete?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    update?: AiChatUpdateWithWhereUniqueWithoutApplicationInput | AiChatUpdateWithWhereUniqueWithoutApplicationInput[]
    updateMany?: AiChatUpdateManyWithWhereWithoutApplicationInput | AiChatUpdateManyWithWhereWithoutApplicationInput[]
    deleteMany?: AiChatScalarWhereInput | AiChatScalarWhereInput[]
  }

  export type OrganizationUpdateOneRequiredWithoutApplicationsNestedInput = {
    create?: XOR<OrganizationCreateWithoutApplicationsInput, OrganizationUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutApplicationsInput
    upsert?: OrganizationUpsertWithoutApplicationsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutApplicationsInput, OrganizationUpdateWithoutApplicationsInput>, OrganizationUncheckedUpdateWithoutApplicationsInput>
  }

  export type AiChatUncheckedUpdateManyWithoutApplicationNestedInput = {
    create?: XOR<AiChatCreateWithoutApplicationInput, AiChatUncheckedCreateWithoutApplicationInput> | AiChatCreateWithoutApplicationInput[] | AiChatUncheckedCreateWithoutApplicationInput[]
    connectOrCreate?: AiChatCreateOrConnectWithoutApplicationInput | AiChatCreateOrConnectWithoutApplicationInput[]
    upsert?: AiChatUpsertWithWhereUniqueWithoutApplicationInput | AiChatUpsertWithWhereUniqueWithoutApplicationInput[]
    createMany?: AiChatCreateManyApplicationInputEnvelope
    set?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    disconnect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    delete?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    connect?: AiChatWhereUniqueInput | AiChatWhereUniqueInput[]
    update?: AiChatUpdateWithWhereUniqueWithoutApplicationInput | AiChatUpdateWithWhereUniqueWithoutApplicationInput[]
    updateMany?: AiChatUpdateManyWithWhereWithoutApplicationInput | AiChatUpdateManyWithWhereWithoutApplicationInput[]
    deleteMany?: AiChatScalarWhereInput | AiChatScalarWhereInput[]
  }

  export type AiChatMessageCreateNestedManyWithoutChatInput = {
    create?: XOR<AiChatMessageCreateWithoutChatInput, AiChatMessageUncheckedCreateWithoutChatInput> | AiChatMessageCreateWithoutChatInput[] | AiChatMessageUncheckedCreateWithoutChatInput[]
    connectOrCreate?: AiChatMessageCreateOrConnectWithoutChatInput | AiChatMessageCreateOrConnectWithoutChatInput[]
    createMany?: AiChatMessageCreateManyChatInputEnvelope
    connect?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
  }

  export type ApplicationCreateNestedOneWithoutAiChatsInput = {
    create?: XOR<ApplicationCreateWithoutAiChatsInput, ApplicationUncheckedCreateWithoutAiChatsInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutAiChatsInput
    connect?: ApplicationWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutAiChatsInput = {
    create?: XOR<UserCreateWithoutAiChatsInput, UserUncheckedCreateWithoutAiChatsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAiChatsInput
    connect?: UserWhereUniqueInput
  }

  export type OrganizationCreateNestedOneWithoutAiChatsInput = {
    create?: XOR<OrganizationCreateWithoutAiChatsInput, OrganizationUncheckedCreateWithoutAiChatsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutAiChatsInput
    connect?: OrganizationWhereUniqueInput
  }

  export type AiChatMessageUncheckedCreateNestedManyWithoutChatInput = {
    create?: XOR<AiChatMessageCreateWithoutChatInput, AiChatMessageUncheckedCreateWithoutChatInput> | AiChatMessageCreateWithoutChatInput[] | AiChatMessageUncheckedCreateWithoutChatInput[]
    connectOrCreate?: AiChatMessageCreateOrConnectWithoutChatInput | AiChatMessageCreateOrConnectWithoutChatInput[]
    createMany?: AiChatMessageCreateManyChatInputEnvelope
    connect?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
  }

  export type EnumAiChatContextFieldUpdateOperationsInput = {
    set?: $Enums.AiChatContext
  }

  export type AiChatMessageUpdateManyWithoutChatNestedInput = {
    create?: XOR<AiChatMessageCreateWithoutChatInput, AiChatMessageUncheckedCreateWithoutChatInput> | AiChatMessageCreateWithoutChatInput[] | AiChatMessageUncheckedCreateWithoutChatInput[]
    connectOrCreate?: AiChatMessageCreateOrConnectWithoutChatInput | AiChatMessageCreateOrConnectWithoutChatInput[]
    upsert?: AiChatMessageUpsertWithWhereUniqueWithoutChatInput | AiChatMessageUpsertWithWhereUniqueWithoutChatInput[]
    createMany?: AiChatMessageCreateManyChatInputEnvelope
    set?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
    disconnect?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
    delete?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
    connect?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
    update?: AiChatMessageUpdateWithWhereUniqueWithoutChatInput | AiChatMessageUpdateWithWhereUniqueWithoutChatInput[]
    updateMany?: AiChatMessageUpdateManyWithWhereWithoutChatInput | AiChatMessageUpdateManyWithWhereWithoutChatInput[]
    deleteMany?: AiChatMessageScalarWhereInput | AiChatMessageScalarWhereInput[]
  }

  export type ApplicationUpdateOneWithoutAiChatsNestedInput = {
    create?: XOR<ApplicationCreateWithoutAiChatsInput, ApplicationUncheckedCreateWithoutAiChatsInput>
    connectOrCreate?: ApplicationCreateOrConnectWithoutAiChatsInput
    upsert?: ApplicationUpsertWithoutAiChatsInput
    disconnect?: ApplicationWhereInput | boolean
    delete?: ApplicationWhereInput | boolean
    connect?: ApplicationWhereUniqueInput
    update?: XOR<XOR<ApplicationUpdateToOneWithWhereWithoutAiChatsInput, ApplicationUpdateWithoutAiChatsInput>, ApplicationUncheckedUpdateWithoutAiChatsInput>
  }

  export type UserUpdateOneRequiredWithoutAiChatsNestedInput = {
    create?: XOR<UserCreateWithoutAiChatsInput, UserUncheckedCreateWithoutAiChatsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAiChatsInput
    upsert?: UserUpsertWithoutAiChatsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAiChatsInput, UserUpdateWithoutAiChatsInput>, UserUncheckedUpdateWithoutAiChatsInput>
  }

  export type OrganizationUpdateOneRequiredWithoutAiChatsNestedInput = {
    create?: XOR<OrganizationCreateWithoutAiChatsInput, OrganizationUncheckedCreateWithoutAiChatsInput>
    connectOrCreate?: OrganizationCreateOrConnectWithoutAiChatsInput
    upsert?: OrganizationUpsertWithoutAiChatsInput
    connect?: OrganizationWhereUniqueInput
    update?: XOR<XOR<OrganizationUpdateToOneWithWhereWithoutAiChatsInput, OrganizationUpdateWithoutAiChatsInput>, OrganizationUncheckedUpdateWithoutAiChatsInput>
  }

  export type AiChatMessageUncheckedUpdateManyWithoutChatNestedInput = {
    create?: XOR<AiChatMessageCreateWithoutChatInput, AiChatMessageUncheckedCreateWithoutChatInput> | AiChatMessageCreateWithoutChatInput[] | AiChatMessageUncheckedCreateWithoutChatInput[]
    connectOrCreate?: AiChatMessageCreateOrConnectWithoutChatInput | AiChatMessageCreateOrConnectWithoutChatInput[]
    upsert?: AiChatMessageUpsertWithWhereUniqueWithoutChatInput | AiChatMessageUpsertWithWhereUniqueWithoutChatInput[]
    createMany?: AiChatMessageCreateManyChatInputEnvelope
    set?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
    disconnect?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
    delete?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
    connect?: AiChatMessageWhereUniqueInput | AiChatMessageWhereUniqueInput[]
    update?: AiChatMessageUpdateWithWhereUniqueWithoutChatInput | AiChatMessageUpdateWithWhereUniqueWithoutChatInput[]
    updateMany?: AiChatMessageUpdateManyWithWhereWithoutChatInput | AiChatMessageUpdateManyWithWhereWithoutChatInput[]
    deleteMany?: AiChatMessageScalarWhereInput | AiChatMessageScalarWhereInput[]
  }

  export type AiChatCreateNestedOneWithoutMessagesInput = {
    create?: XOR<AiChatCreateWithoutMessagesInput, AiChatUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: AiChatCreateOrConnectWithoutMessagesInput
    connect?: AiChatWhereUniqueInput
  }

  export type EnumMessageRoleFieldUpdateOperationsInput = {
    set?: $Enums.MessageRole
  }

  export type AiChatUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<AiChatCreateWithoutMessagesInput, AiChatUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: AiChatCreateOrConnectWithoutMessagesInput
    upsert?: AiChatUpsertWithoutMessagesInput
    connect?: AiChatWhereUniqueInput
    update?: XOR<XOR<AiChatUpdateToOneWithWhereWithoutMessagesInput, AiChatUpdateWithoutMessagesInput>, AiChatUncheckedUpdateWithoutMessagesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumopportunity_status_enumFilter<$PrismaModel = never> = {
    equals?: $Enums.opportunity_status_enum | Enumopportunity_status_enumFieldRefInput<$PrismaModel>
    in?: $Enums.opportunity_status_enum[] | ListEnumopportunity_status_enumFieldRefInput<$PrismaModel>
    notIn?: $Enums.opportunity_status_enum[] | ListEnumopportunity_status_enumFieldRefInput<$PrismaModel>
    not?: NestedEnumopportunity_status_enumFilter<$PrismaModel> | $Enums.opportunity_status_enum
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumopportunity_status_enumWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.opportunity_status_enum | Enumopportunity_status_enumFieldRefInput<$PrismaModel>
    in?: $Enums.opportunity_status_enum[] | ListEnumopportunity_status_enumFieldRefInput<$PrismaModel>
    notIn?: $Enums.opportunity_status_enum[] | ListEnumopportunity_status_enumFieldRefInput<$PrismaModel>
    not?: NestedEnumopportunity_status_enumWithAggregatesFilter<$PrismaModel> | $Enums.opportunity_status_enum
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumopportunity_status_enumFilter<$PrismaModel>
    _max?: NestedEnumopportunity_status_enumFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumOrganizationTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationType | EnumOrganizationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrganizationType[] | ListEnumOrganizationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrganizationType[] | ListEnumOrganizationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrganizationTypeFilter<$PrismaModel> | $Enums.OrganizationType
  }

  export type NestedEnumOrganizationRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationRole | EnumOrganizationRoleFieldRefInput<$PrismaModel>
    in?: $Enums.OrganizationRole[] | ListEnumOrganizationRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrganizationRole[] | ListEnumOrganizationRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumOrganizationRoleFilter<$PrismaModel> | $Enums.OrganizationRole
  }

  export type NestedEnumOrganizationTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationType | EnumOrganizationTypeFieldRefInput<$PrismaModel>
    in?: $Enums.OrganizationType[] | ListEnumOrganizationTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrganizationType[] | ListEnumOrganizationTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumOrganizationTypeWithAggregatesFilter<$PrismaModel> | $Enums.OrganizationType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrganizationTypeFilter<$PrismaModel>
    _max?: NestedEnumOrganizationTypeFilter<$PrismaModel>
  }

  export type NestedEnumOrganizationRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrganizationRole | EnumOrganizationRoleFieldRefInput<$PrismaModel>
    in?: $Enums.OrganizationRole[] | ListEnumOrganizationRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrganizationRole[] | ListEnumOrganizationRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumOrganizationRoleWithAggregatesFilter<$PrismaModel> | $Enums.OrganizationRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrganizationRoleFilter<$PrismaModel>
    _max?: NestedEnumOrganizationRoleFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumGoNoGoDecisionFilter<$PrismaModel = never> = {
    equals?: $Enums.GoNoGoDecision | EnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    in?: $Enums.GoNoGoDecision[] | ListEnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    notIn?: $Enums.GoNoGoDecision[] | ListEnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    not?: NestedEnumGoNoGoDecisionFilter<$PrismaModel> | $Enums.GoNoGoDecision
  }

  export type NestedEnumGoNoGoDecisionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GoNoGoDecision | EnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    in?: $Enums.GoNoGoDecision[] | ListEnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    notIn?: $Enums.GoNoGoDecision[] | ListEnumGoNoGoDecisionFieldRefInput<$PrismaModel>
    not?: NestedEnumGoNoGoDecisionWithAggregatesFilter<$PrismaModel> | $Enums.GoNoGoDecision
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGoNoGoDecisionFilter<$PrismaModel>
    _max?: NestedEnumGoNoGoDecisionFilter<$PrismaModel>
  }

  export type NestedEnumApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusFilter<$PrismaModel> | $Enums.ApplicationStatus
  }

  export type NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumApplicationStatusFilter<$PrismaModel>
  }

  export type NestedEnumAiChatContextFilter<$PrismaModel = never> = {
    equals?: $Enums.AiChatContext | EnumAiChatContextFieldRefInput<$PrismaModel>
    in?: $Enums.AiChatContext[] | ListEnumAiChatContextFieldRefInput<$PrismaModel>
    notIn?: $Enums.AiChatContext[] | ListEnumAiChatContextFieldRefInput<$PrismaModel>
    not?: NestedEnumAiChatContextFilter<$PrismaModel> | $Enums.AiChatContext
  }

  export type NestedEnumAiChatContextWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AiChatContext | EnumAiChatContextFieldRefInput<$PrismaModel>
    in?: $Enums.AiChatContext[] | ListEnumAiChatContextFieldRefInput<$PrismaModel>
    notIn?: $Enums.AiChatContext[] | ListEnumAiChatContextFieldRefInput<$PrismaModel>
    not?: NestedEnumAiChatContextWithAggregatesFilter<$PrismaModel> | $Enums.AiChatContext
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAiChatContextFilter<$PrismaModel>
    _max?: NestedEnumAiChatContextFilter<$PrismaModel>
  }

  export type NestedEnumMessageRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageRole | EnumMessageRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MessageRole[] | ListEnumMessageRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageRole[] | ListEnumMessageRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageRoleFilter<$PrismaModel> | $Enums.MessageRole
  }

  export type NestedEnumMessageRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MessageRole | EnumMessageRoleFieldRefInput<$PrismaModel>
    in?: $Enums.MessageRole[] | ListEnumMessageRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.MessageRole[] | ListEnumMessageRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumMessageRoleWithAggregatesFilter<$PrismaModel> | $Enums.MessageRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMessageRoleFilter<$PrismaModel>
    _max?: NestedEnumMessageRoleFilter<$PrismaModel>
  }

  export type AiChatCreateWithoutUserInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    messages?: AiChatMessageCreateNestedManyWithoutChatInput
    application?: ApplicationCreateNestedOneWithoutAiChatsInput
    organization: OrganizationCreateNestedOneWithoutAiChatsInput
  }

  export type AiChatUncheckedCreateWithoutUserInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
    applicationId?: string | null
    messages?: AiChatMessageUncheckedCreateNestedManyWithoutChatInput
  }

  export type AiChatCreateOrConnectWithoutUserInput = {
    where: AiChatWhereUniqueInput
    create: XOR<AiChatCreateWithoutUserInput, AiChatUncheckedCreateWithoutUserInput>
  }

  export type AiChatCreateManyUserInputEnvelope = {
    data: AiChatCreateManyUserInput | AiChatCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type GrantBookmarkCreateWithoutUserInput = {
    id?: string
    notes?: string | null
    createdAt?: Date | string
    opportunityId: number
    organization: OrganizationCreateNestedOneWithoutGrantBookmarksInput
  }

  export type GrantBookmarkUncheckedCreateWithoutUserInput = {
    id?: string
    notes?: string | null
    createdAt?: Date | string
    organizationId: string
    opportunityId: number
  }

  export type GrantBookmarkCreateOrConnectWithoutUserInput = {
    where: GrantBookmarkWhereUniqueInput
    create: XOR<GrantBookmarkCreateWithoutUserInput, GrantBookmarkUncheckedCreateWithoutUserInput>
  }

  export type GrantBookmarkCreateManyUserInputEnvelope = {
    data: GrantBookmarkCreateManyUserInput | GrantBookmarkCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationCreateWithoutUserInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    aiChats?: AiChatCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisCreateNestedManyWithoutOrganizationInput
    schoolDistrict?: SchoolDistrictCreateNestedOneWithoutOrganizationsInput
  }

  export type OrganizationUncheckedCreateWithoutUserInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    schoolDistrictId?: string | null
    aiChats?: AiChatUncheckedCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationUncheckedCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkUncheckedCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedCreateNestedManyWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutUserInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutUserInput, OrganizationUncheckedCreateWithoutUserInput>
  }

  export type AiChatUpsertWithWhereUniqueWithoutUserInput = {
    where: AiChatWhereUniqueInput
    update: XOR<AiChatUpdateWithoutUserInput, AiChatUncheckedUpdateWithoutUserInput>
    create: XOR<AiChatCreateWithoutUserInput, AiChatUncheckedCreateWithoutUserInput>
  }

  export type AiChatUpdateWithWhereUniqueWithoutUserInput = {
    where: AiChatWhereUniqueInput
    data: XOR<AiChatUpdateWithoutUserInput, AiChatUncheckedUpdateWithoutUserInput>
  }

  export type AiChatUpdateManyWithWhereWithoutUserInput = {
    where: AiChatScalarWhereInput
    data: XOR<AiChatUpdateManyMutationInput, AiChatUncheckedUpdateManyWithoutUserInput>
  }

  export type AiChatScalarWhereInput = {
    AND?: AiChatScalarWhereInput | AiChatScalarWhereInput[]
    OR?: AiChatScalarWhereInput[]
    NOT?: AiChatScalarWhereInput | AiChatScalarWhereInput[]
    id?: StringFilter<"AiChat"> | string
    title?: StringNullableFilter<"AiChat"> | string | null
    context?: EnumAiChatContextFilter<"AiChat"> | $Enums.AiChatContext
    createdAt?: DateTimeFilter<"AiChat"> | Date | string
    updatedAt?: DateTimeFilter<"AiChat"> | Date | string
    organizationId?: StringFilter<"AiChat"> | string
    userId?: UuidFilter<"AiChat"> | string
    applicationId?: StringNullableFilter<"AiChat"> | string | null
  }

  export type GrantBookmarkUpsertWithWhereUniqueWithoutUserInput = {
    where: GrantBookmarkWhereUniqueInput
    update: XOR<GrantBookmarkUpdateWithoutUserInput, GrantBookmarkUncheckedUpdateWithoutUserInput>
    create: XOR<GrantBookmarkCreateWithoutUserInput, GrantBookmarkUncheckedCreateWithoutUserInput>
  }

  export type GrantBookmarkUpdateWithWhereUniqueWithoutUserInput = {
    where: GrantBookmarkWhereUniqueInput
    data: XOR<GrantBookmarkUpdateWithoutUserInput, GrantBookmarkUncheckedUpdateWithoutUserInput>
  }

  export type GrantBookmarkUpdateManyWithWhereWithoutUserInput = {
    where: GrantBookmarkScalarWhereInput
    data: XOR<GrantBookmarkUpdateManyMutationInput, GrantBookmarkUncheckedUpdateManyWithoutUserInput>
  }

  export type GrantBookmarkScalarWhereInput = {
    AND?: GrantBookmarkScalarWhereInput | GrantBookmarkScalarWhereInput[]
    OR?: GrantBookmarkScalarWhereInput[]
    NOT?: GrantBookmarkScalarWhereInput | GrantBookmarkScalarWhereInput[]
    id?: StringFilter<"GrantBookmark"> | string
    notes?: StringNullableFilter<"GrantBookmark"> | string | null
    createdAt?: DateTimeFilter<"GrantBookmark"> | Date | string
    organizationId?: StringFilter<"GrantBookmark"> | string
    userId?: UuidFilter<"GrantBookmark"> | string
    opportunityId?: IntFilter<"GrantBookmark"> | number
  }

  export type OrganizationUpsertWithoutUserInput = {
    update: XOR<OrganizationUpdateWithoutUserInput, OrganizationUncheckedUpdateWithoutUserInput>
    create: XOR<OrganizationCreateWithoutUserInput, OrganizationUncheckedCreateWithoutUserInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutUserInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutUserInput, OrganizationUncheckedUpdateWithoutUserInput>
  }

  export type OrganizationUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUpdateManyWithoutOrganizationNestedInput
    schoolDistrict?: SchoolDistrictUpdateOneWithoutOrganizationsNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schoolDistrictId?: NullableStringFieldUpdateOperationsInput | string | null
    aiChats?: AiChatUncheckedUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUncheckedUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUncheckedUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedUpdateManyWithoutOrganizationNestedInput
  }

  export type AiChatCreateWithoutOrganizationInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    messages?: AiChatMessageCreateNestedManyWithoutChatInput
    application?: ApplicationCreateNestedOneWithoutAiChatsInput
    user: UserCreateNestedOneWithoutAiChatsInput
  }

  export type AiChatUncheckedCreateWithoutOrganizationInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    applicationId?: string | null
    messages?: AiChatMessageUncheckedCreateNestedManyWithoutChatInput
  }

  export type AiChatCreateOrConnectWithoutOrganizationInput = {
    where: AiChatWhereUniqueInput
    create: XOR<AiChatCreateWithoutOrganizationInput, AiChatUncheckedCreateWithoutOrganizationInput>
  }

  export type AiChatCreateManyOrganizationInputEnvelope = {
    data: AiChatCreateManyOrganizationInput | AiChatCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type ApplicationCreateWithoutOrganizationInput = {
    id?: string
    opportunityId: number
    status?: $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: string | null
    title?: string | null
    notes?: string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    submittedAt?: Date | string | null
    lastEditedAt?: Date | string
    aiChats?: AiChatCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationUncheckedCreateWithoutOrganizationInput = {
    id?: string
    opportunityId: number
    status?: $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: string | null
    title?: string | null
    notes?: string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    submittedAt?: Date | string | null
    lastEditedAt?: Date | string
    aiChats?: AiChatUncheckedCreateNestedManyWithoutApplicationInput
  }

  export type ApplicationCreateOrConnectWithoutOrganizationInput = {
    where: ApplicationWhereUniqueInput
    create: XOR<ApplicationCreateWithoutOrganizationInput, ApplicationUncheckedCreateWithoutOrganizationInput>
  }

  export type ApplicationCreateManyOrganizationInputEnvelope = {
    data: ApplicationCreateManyOrganizationInput | ApplicationCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type GrantBookmarkCreateWithoutOrganizationInput = {
    id?: string
    notes?: string | null
    createdAt?: Date | string
    opportunityId: number
    user: UserCreateNestedOneWithoutGrantBookmarksInput
  }

  export type GrantBookmarkUncheckedCreateWithoutOrganizationInput = {
    id?: string
    notes?: string | null
    createdAt?: Date | string
    userId: string
    opportunityId: number
  }

  export type GrantBookmarkCreateOrConnectWithoutOrganizationInput = {
    where: GrantBookmarkWhereUniqueInput
    create: XOR<GrantBookmarkCreateWithoutOrganizationInput, GrantBookmarkUncheckedCreateWithoutOrganizationInput>
  }

  export type GrantBookmarkCreateManyOrganizationInputEnvelope = {
    data: GrantBookmarkCreateManyOrganizationInput | GrantBookmarkCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type GrantEligibilityAnalysisCreateWithoutOrganizationInput = {
    id?: string
    matchScore: number
    goNoGo: $Enums.GoNoGoDecision
    rationale: string
    risks?: string | null
    confidence?: number | null
    createdAt?: Date | string
    opportunityId: number
  }

  export type GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput = {
    id?: string
    matchScore: number
    goNoGo: $Enums.GoNoGoDecision
    rationale: string
    risks?: string | null
    confidence?: number | null
    createdAt?: Date | string
    opportunityId: number
  }

  export type GrantEligibilityAnalysisCreateOrConnectWithoutOrganizationInput = {
    where: GrantEligibilityAnalysisWhereUniqueInput
    create: XOR<GrantEligibilityAnalysisCreateWithoutOrganizationInput, GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput>
  }

  export type GrantEligibilityAnalysisCreateManyOrganizationInputEnvelope = {
    data: GrantEligibilityAnalysisCreateManyOrganizationInput | GrantEligibilityAnalysisCreateManyOrganizationInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutOrganizationInput = {
    id: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatarUrl?: string | null
    lastActiveAt?: Date | string
    system_admin?: boolean
    aiChats?: AiChatCreateNestedManyWithoutUserInput
    grantBookmarks?: GrantBookmarkCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOrganizationInput = {
    id: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatarUrl?: string | null
    lastActiveAt?: Date | string
    system_admin?: boolean
    aiChats?: AiChatUncheckedCreateNestedManyWithoutUserInput
    grantBookmarks?: GrantBookmarkUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOrganizationInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput>
  }

  export type SchoolDistrictCreateWithoutOrganizationsInput = {
    id?: string
    leaId: string
    name: string
    stateCode: string
    stateLeaId?: string | null
    city?: string | null
    zipCode?: string | null
    phone?: string | null
    latitude?: number | null
    longitude?: number | null
    countyName?: string | null
    enrollment?: number | null
    numberOfSchools?: number | null
    lowestGrade?: number | null
    highestGrade?: number | null
    urbanCentricLocale?: number | null
    year?: number
  }

  export type SchoolDistrictUncheckedCreateWithoutOrganizationsInput = {
    id?: string
    leaId: string
    name: string
    stateCode: string
    stateLeaId?: string | null
    city?: string | null
    zipCode?: string | null
    phone?: string | null
    latitude?: number | null
    longitude?: number | null
    countyName?: string | null
    enrollment?: number | null
    numberOfSchools?: number | null
    lowestGrade?: number | null
    highestGrade?: number | null
    urbanCentricLocale?: number | null
    year?: number
  }

  export type SchoolDistrictCreateOrConnectWithoutOrganizationsInput = {
    where: SchoolDistrictWhereUniqueInput
    create: XOR<SchoolDistrictCreateWithoutOrganizationsInput, SchoolDistrictUncheckedCreateWithoutOrganizationsInput>
  }

  export type AiChatUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: AiChatWhereUniqueInput
    update: XOR<AiChatUpdateWithoutOrganizationInput, AiChatUncheckedUpdateWithoutOrganizationInput>
    create: XOR<AiChatCreateWithoutOrganizationInput, AiChatUncheckedCreateWithoutOrganizationInput>
  }

  export type AiChatUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: AiChatWhereUniqueInput
    data: XOR<AiChatUpdateWithoutOrganizationInput, AiChatUncheckedUpdateWithoutOrganizationInput>
  }

  export type AiChatUpdateManyWithWhereWithoutOrganizationInput = {
    where: AiChatScalarWhereInput
    data: XOR<AiChatUpdateManyMutationInput, AiChatUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type ApplicationUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: ApplicationWhereUniqueInput
    update: XOR<ApplicationUpdateWithoutOrganizationInput, ApplicationUncheckedUpdateWithoutOrganizationInput>
    create: XOR<ApplicationCreateWithoutOrganizationInput, ApplicationUncheckedCreateWithoutOrganizationInput>
  }

  export type ApplicationUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: ApplicationWhereUniqueInput
    data: XOR<ApplicationUpdateWithoutOrganizationInput, ApplicationUncheckedUpdateWithoutOrganizationInput>
  }

  export type ApplicationUpdateManyWithWhereWithoutOrganizationInput = {
    where: ApplicationScalarWhereInput
    data: XOR<ApplicationUpdateManyMutationInput, ApplicationUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type ApplicationScalarWhereInput = {
    AND?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
    OR?: ApplicationScalarWhereInput[]
    NOT?: ApplicationScalarWhereInput | ApplicationScalarWhereInput[]
    id?: StringFilter<"Application"> | string
    opportunityId?: IntFilter<"Application"> | number
    organizationId?: StringFilter<"Application"> | string
    status?: EnumApplicationStatusFilter<"Application"> | $Enums.ApplicationStatus
    content?: JsonNullableFilter<"Application">
    contentHtml?: StringNullableFilter<"Application"> | string | null
    title?: StringNullableFilter<"Application"> | string | null
    notes?: StringNullableFilter<"Application"> | string | null
    documents?: JsonNullableFilter<"Application">
    createdAt?: DateTimeFilter<"Application"> | Date | string
    updatedAt?: DateTimeFilter<"Application"> | Date | string
    submittedAt?: DateTimeNullableFilter<"Application"> | Date | string | null
    lastEditedAt?: DateTimeFilter<"Application"> | Date | string
  }

  export type GrantBookmarkUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: GrantBookmarkWhereUniqueInput
    update: XOR<GrantBookmarkUpdateWithoutOrganizationInput, GrantBookmarkUncheckedUpdateWithoutOrganizationInput>
    create: XOR<GrantBookmarkCreateWithoutOrganizationInput, GrantBookmarkUncheckedCreateWithoutOrganizationInput>
  }

  export type GrantBookmarkUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: GrantBookmarkWhereUniqueInput
    data: XOR<GrantBookmarkUpdateWithoutOrganizationInput, GrantBookmarkUncheckedUpdateWithoutOrganizationInput>
  }

  export type GrantBookmarkUpdateManyWithWhereWithoutOrganizationInput = {
    where: GrantBookmarkScalarWhereInput
    data: XOR<GrantBookmarkUpdateManyMutationInput, GrantBookmarkUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type GrantEligibilityAnalysisUpsertWithWhereUniqueWithoutOrganizationInput = {
    where: GrantEligibilityAnalysisWhereUniqueInput
    update: XOR<GrantEligibilityAnalysisUpdateWithoutOrganizationInput, GrantEligibilityAnalysisUncheckedUpdateWithoutOrganizationInput>
    create: XOR<GrantEligibilityAnalysisCreateWithoutOrganizationInput, GrantEligibilityAnalysisUncheckedCreateWithoutOrganizationInput>
  }

  export type GrantEligibilityAnalysisUpdateWithWhereUniqueWithoutOrganizationInput = {
    where: GrantEligibilityAnalysisWhereUniqueInput
    data: XOR<GrantEligibilityAnalysisUpdateWithoutOrganizationInput, GrantEligibilityAnalysisUncheckedUpdateWithoutOrganizationInput>
  }

  export type GrantEligibilityAnalysisUpdateManyWithWhereWithoutOrganizationInput = {
    where: GrantEligibilityAnalysisScalarWhereInput
    data: XOR<GrantEligibilityAnalysisUpdateManyMutationInput, GrantEligibilityAnalysisUncheckedUpdateManyWithoutOrganizationInput>
  }

  export type GrantEligibilityAnalysisScalarWhereInput = {
    AND?: GrantEligibilityAnalysisScalarWhereInput | GrantEligibilityAnalysisScalarWhereInput[]
    OR?: GrantEligibilityAnalysisScalarWhereInput[]
    NOT?: GrantEligibilityAnalysisScalarWhereInput | GrantEligibilityAnalysisScalarWhereInput[]
    id?: StringFilter<"GrantEligibilityAnalysis"> | string
    matchScore?: IntFilter<"GrantEligibilityAnalysis"> | number
    goNoGo?: EnumGoNoGoDecisionFilter<"GrantEligibilityAnalysis"> | $Enums.GoNoGoDecision
    rationale?: StringFilter<"GrantEligibilityAnalysis"> | string
    risks?: StringNullableFilter<"GrantEligibilityAnalysis"> | string | null
    confidence?: FloatNullableFilter<"GrantEligibilityAnalysis"> | number | null
    createdAt?: DateTimeFilter<"GrantEligibilityAnalysis"> | Date | string
    organizationId?: StringFilter<"GrantEligibilityAnalysis"> | string
    opportunityId?: IntFilter<"GrantEligibilityAnalysis"> | number
  }

  export type UserUpsertWithoutOrganizationInput = {
    update: XOR<UserUpdateWithoutOrganizationInput, UserUncheckedUpdateWithoutOrganizationInput>
    create: XOR<UserCreateWithoutOrganizationInput, UserUncheckedCreateWithoutOrganizationInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOrganizationInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOrganizationInput, UserUncheckedUpdateWithoutOrganizationInput>
  }

  export type UserUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
    aiChats?: AiChatUpdateManyWithoutUserNestedInput
    grantBookmarks?: GrantBookmarkUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
    aiChats?: AiChatUncheckedUpdateManyWithoutUserNestedInput
    grantBookmarks?: GrantBookmarkUncheckedUpdateManyWithoutUserNestedInput
  }

  export type SchoolDistrictUpsertWithoutOrganizationsInput = {
    update: XOR<SchoolDistrictUpdateWithoutOrganizationsInput, SchoolDistrictUncheckedUpdateWithoutOrganizationsInput>
    create: XOR<SchoolDistrictCreateWithoutOrganizationsInput, SchoolDistrictUncheckedCreateWithoutOrganizationsInput>
    where?: SchoolDistrictWhereInput
  }

  export type SchoolDistrictUpdateToOneWithWhereWithoutOrganizationsInput = {
    where?: SchoolDistrictWhereInput
    data: XOR<SchoolDistrictUpdateWithoutOrganizationsInput, SchoolDistrictUncheckedUpdateWithoutOrganizationsInput>
  }

  export type SchoolDistrictUpdateWithoutOrganizationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    leaId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    stateCode?: StringFieldUpdateOperationsInput | string
    stateLeaId?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    countyName?: NullableStringFieldUpdateOperationsInput | string | null
    enrollment?: NullableIntFieldUpdateOperationsInput | number | null
    numberOfSchools?: NullableIntFieldUpdateOperationsInput | number | null
    lowestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    highestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    urbanCentricLocale?: NullableIntFieldUpdateOperationsInput | number | null
    year?: IntFieldUpdateOperationsInput | number
  }

  export type SchoolDistrictUncheckedUpdateWithoutOrganizationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    leaId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    stateCode?: StringFieldUpdateOperationsInput | string
    stateLeaId?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    latitude?: NullableFloatFieldUpdateOperationsInput | number | null
    longitude?: NullableFloatFieldUpdateOperationsInput | number | null
    countyName?: NullableStringFieldUpdateOperationsInput | string | null
    enrollment?: NullableIntFieldUpdateOperationsInput | number | null
    numberOfSchools?: NullableIntFieldUpdateOperationsInput | number | null
    lowestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    highestGrade?: NullableIntFieldUpdateOperationsInput | number | null
    urbanCentricLocale?: NullableIntFieldUpdateOperationsInput | number | null
    year?: IntFieldUpdateOperationsInput | number
  }

  export type OrganizationCreateWithoutSchoolDistrictInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    aiChats?: AiChatCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisCreateNestedManyWithoutOrganizationInput
    user?: UserCreateNestedOneWithoutOrganizationInput
  }

  export type OrganizationUncheckedCreateWithoutSchoolDistrictInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    aiChats?: AiChatUncheckedCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationUncheckedCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkUncheckedCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedCreateNestedManyWithoutOrganizationInput
    user?: UserUncheckedCreateNestedOneWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutSchoolDistrictInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutSchoolDistrictInput, OrganizationUncheckedCreateWithoutSchoolDistrictInput>
  }

  export type OrganizationCreateManySchoolDistrictInputEnvelope = {
    data: OrganizationCreateManySchoolDistrictInput | OrganizationCreateManySchoolDistrictInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationUpsertWithWhereUniqueWithoutSchoolDistrictInput = {
    where: OrganizationWhereUniqueInput
    update: XOR<OrganizationUpdateWithoutSchoolDistrictInput, OrganizationUncheckedUpdateWithoutSchoolDistrictInput>
    create: XOR<OrganizationCreateWithoutSchoolDistrictInput, OrganizationUncheckedCreateWithoutSchoolDistrictInput>
  }

  export type OrganizationUpdateWithWhereUniqueWithoutSchoolDistrictInput = {
    where: OrganizationWhereUniqueInput
    data: XOR<OrganizationUpdateWithoutSchoolDistrictInput, OrganizationUncheckedUpdateWithoutSchoolDistrictInput>
  }

  export type OrganizationUpdateManyWithWhereWithoutSchoolDistrictInput = {
    where: OrganizationScalarWhereInput
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyWithoutSchoolDistrictInput>
  }

  export type OrganizationScalarWhereInput = {
    AND?: OrganizationScalarWhereInput | OrganizationScalarWhereInput[]
    OR?: OrganizationScalarWhereInput[]
    NOT?: OrganizationScalarWhereInput | OrganizationScalarWhereInput[]
    id?: StringFilter<"Organization"> | string
    name?: StringFilter<"Organization"> | string
    slug?: StringFilter<"Organization"> | string
    type?: EnumOrganizationTypeFilter<"Organization"> | $Enums.OrganizationType
    role?: EnumOrganizationRoleFilter<"Organization"> | $Enums.OrganizationRole
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
    schoolDistrictId?: StringNullableFilter<"Organization"> | string | null
  }

  export type UserCreateWithoutGrantBookmarksInput = {
    id: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatarUrl?: string | null
    lastActiveAt?: Date | string
    system_admin?: boolean
    aiChats?: AiChatCreateNestedManyWithoutUserInput
    organization: OrganizationCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutGrantBookmarksInput = {
    id: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatarUrl?: string | null
    lastActiveAt?: Date | string
    organizationId: string
    system_admin?: boolean
    aiChats?: AiChatUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutGrantBookmarksInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutGrantBookmarksInput, UserUncheckedCreateWithoutGrantBookmarksInput>
  }

  export type OrganizationCreateWithoutGrantBookmarksInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    aiChats?: AiChatCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisCreateNestedManyWithoutOrganizationInput
    user?: UserCreateNestedOneWithoutOrganizationInput
    schoolDistrict?: SchoolDistrictCreateNestedOneWithoutOrganizationsInput
  }

  export type OrganizationUncheckedCreateWithoutGrantBookmarksInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    schoolDistrictId?: string | null
    aiChats?: AiChatUncheckedCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationUncheckedCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedCreateNestedManyWithoutOrganizationInput
    user?: UserUncheckedCreateNestedOneWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutGrantBookmarksInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutGrantBookmarksInput, OrganizationUncheckedCreateWithoutGrantBookmarksInput>
  }

  export type UserUpsertWithoutGrantBookmarksInput = {
    update: XOR<UserUpdateWithoutGrantBookmarksInput, UserUncheckedUpdateWithoutGrantBookmarksInput>
    create: XOR<UserCreateWithoutGrantBookmarksInput, UserUncheckedCreateWithoutGrantBookmarksInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutGrantBookmarksInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutGrantBookmarksInput, UserUncheckedUpdateWithoutGrantBookmarksInput>
  }

  export type UserUpdateWithoutGrantBookmarksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
    aiChats?: AiChatUpdateManyWithoutUserNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutGrantBookmarksInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
    aiChats?: AiChatUncheckedUpdateManyWithoutUserNestedInput
  }

  export type OrganizationUpsertWithoutGrantBookmarksInput = {
    update: XOR<OrganizationUpdateWithoutGrantBookmarksInput, OrganizationUncheckedUpdateWithoutGrantBookmarksInput>
    create: XOR<OrganizationCreateWithoutGrantBookmarksInput, OrganizationUncheckedCreateWithoutGrantBookmarksInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutGrantBookmarksInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutGrantBookmarksInput, OrganizationUncheckedUpdateWithoutGrantBookmarksInput>
  }

  export type OrganizationUpdateWithoutGrantBookmarksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUpdateManyWithoutOrganizationNestedInput
    user?: UserUpdateOneWithoutOrganizationNestedInput
    schoolDistrict?: SchoolDistrictUpdateOneWithoutOrganizationsNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutGrantBookmarksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schoolDistrictId?: NullableStringFieldUpdateOperationsInput | string | null
    aiChats?: AiChatUncheckedUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUncheckedUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedUpdateManyWithoutOrganizationNestedInput
    user?: UserUncheckedUpdateOneWithoutOrganizationNestedInput
  }

  export type OrganizationCreateWithoutEligibilityAnalysesInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    aiChats?: AiChatCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkCreateNestedManyWithoutOrganizationInput
    user?: UserCreateNestedOneWithoutOrganizationInput
    schoolDistrict?: SchoolDistrictCreateNestedOneWithoutOrganizationsInput
  }

  export type OrganizationUncheckedCreateWithoutEligibilityAnalysesInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    schoolDistrictId?: string | null
    aiChats?: AiChatUncheckedCreateNestedManyWithoutOrganizationInput
    applications?: ApplicationUncheckedCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkUncheckedCreateNestedManyWithoutOrganizationInput
    user?: UserUncheckedCreateNestedOneWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutEligibilityAnalysesInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutEligibilityAnalysesInput, OrganizationUncheckedCreateWithoutEligibilityAnalysesInput>
  }

  export type OrganizationUpsertWithoutEligibilityAnalysesInput = {
    update: XOR<OrganizationUpdateWithoutEligibilityAnalysesInput, OrganizationUncheckedUpdateWithoutEligibilityAnalysesInput>
    create: XOR<OrganizationCreateWithoutEligibilityAnalysesInput, OrganizationUncheckedCreateWithoutEligibilityAnalysesInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutEligibilityAnalysesInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutEligibilityAnalysesInput, OrganizationUncheckedUpdateWithoutEligibilityAnalysesInput>
  }

  export type OrganizationUpdateWithoutEligibilityAnalysesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUpdateManyWithoutOrganizationNestedInput
    user?: UserUpdateOneWithoutOrganizationNestedInput
    schoolDistrict?: SchoolDistrictUpdateOneWithoutOrganizationsNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutEligibilityAnalysesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schoolDistrictId?: NullableStringFieldUpdateOperationsInput | string | null
    aiChats?: AiChatUncheckedUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUncheckedUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUncheckedUpdateManyWithoutOrganizationNestedInput
    user?: UserUncheckedUpdateOneWithoutOrganizationNestedInput
  }

  export type AiChatCreateWithoutApplicationInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    messages?: AiChatMessageCreateNestedManyWithoutChatInput
    user: UserCreateNestedOneWithoutAiChatsInput
    organization: OrganizationCreateNestedOneWithoutAiChatsInput
  }

  export type AiChatUncheckedCreateWithoutApplicationInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
    userId: string
    messages?: AiChatMessageUncheckedCreateNestedManyWithoutChatInput
  }

  export type AiChatCreateOrConnectWithoutApplicationInput = {
    where: AiChatWhereUniqueInput
    create: XOR<AiChatCreateWithoutApplicationInput, AiChatUncheckedCreateWithoutApplicationInput>
  }

  export type AiChatCreateManyApplicationInputEnvelope = {
    data: AiChatCreateManyApplicationInput | AiChatCreateManyApplicationInput[]
    skipDuplicates?: boolean
  }

  export type OrganizationCreateWithoutApplicationsInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    aiChats?: AiChatCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisCreateNestedManyWithoutOrganizationInput
    user?: UserCreateNestedOneWithoutOrganizationInput
    schoolDistrict?: SchoolDistrictCreateNestedOneWithoutOrganizationsInput
  }

  export type OrganizationUncheckedCreateWithoutApplicationsInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    schoolDistrictId?: string | null
    aiChats?: AiChatUncheckedCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkUncheckedCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedCreateNestedManyWithoutOrganizationInput
    user?: UserUncheckedCreateNestedOneWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutApplicationsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutApplicationsInput, OrganizationUncheckedCreateWithoutApplicationsInput>
  }

  export type AiChatUpsertWithWhereUniqueWithoutApplicationInput = {
    where: AiChatWhereUniqueInput
    update: XOR<AiChatUpdateWithoutApplicationInput, AiChatUncheckedUpdateWithoutApplicationInput>
    create: XOR<AiChatCreateWithoutApplicationInput, AiChatUncheckedCreateWithoutApplicationInput>
  }

  export type AiChatUpdateWithWhereUniqueWithoutApplicationInput = {
    where: AiChatWhereUniqueInput
    data: XOR<AiChatUpdateWithoutApplicationInput, AiChatUncheckedUpdateWithoutApplicationInput>
  }

  export type AiChatUpdateManyWithWhereWithoutApplicationInput = {
    where: AiChatScalarWhereInput
    data: XOR<AiChatUpdateManyMutationInput, AiChatUncheckedUpdateManyWithoutApplicationInput>
  }

  export type OrganizationUpsertWithoutApplicationsInput = {
    update: XOR<OrganizationUpdateWithoutApplicationsInput, OrganizationUncheckedUpdateWithoutApplicationsInput>
    create: XOR<OrganizationCreateWithoutApplicationsInput, OrganizationUncheckedCreateWithoutApplicationsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutApplicationsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutApplicationsInput, OrganizationUncheckedUpdateWithoutApplicationsInput>
  }

  export type OrganizationUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUpdateManyWithoutOrganizationNestedInput
    user?: UserUpdateOneWithoutOrganizationNestedInput
    schoolDistrict?: SchoolDistrictUpdateOneWithoutOrganizationsNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schoolDistrictId?: NullableStringFieldUpdateOperationsInput | string | null
    aiChats?: AiChatUncheckedUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUncheckedUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedUpdateManyWithoutOrganizationNestedInput
    user?: UserUncheckedUpdateOneWithoutOrganizationNestedInput
  }

  export type AiChatMessageCreateWithoutChatInput = {
    id?: string
    role: $Enums.MessageRole
    content: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AiChatMessageUncheckedCreateWithoutChatInput = {
    id?: string
    role: $Enums.MessageRole
    content: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AiChatMessageCreateOrConnectWithoutChatInput = {
    where: AiChatMessageWhereUniqueInput
    create: XOR<AiChatMessageCreateWithoutChatInput, AiChatMessageUncheckedCreateWithoutChatInput>
  }

  export type AiChatMessageCreateManyChatInputEnvelope = {
    data: AiChatMessageCreateManyChatInput | AiChatMessageCreateManyChatInput[]
    skipDuplicates?: boolean
  }

  export type ApplicationCreateWithoutAiChatsInput = {
    id?: string
    opportunityId: number
    status?: $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: string | null
    title?: string | null
    notes?: string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    submittedAt?: Date | string | null
    lastEditedAt?: Date | string
    organization: OrganizationCreateNestedOneWithoutApplicationsInput
  }

  export type ApplicationUncheckedCreateWithoutAiChatsInput = {
    id?: string
    opportunityId: number
    organizationId: string
    status?: $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: string | null
    title?: string | null
    notes?: string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    submittedAt?: Date | string | null
    lastEditedAt?: Date | string
  }

  export type ApplicationCreateOrConnectWithoutAiChatsInput = {
    where: ApplicationWhereUniqueInput
    create: XOR<ApplicationCreateWithoutAiChatsInput, ApplicationUncheckedCreateWithoutAiChatsInput>
  }

  export type UserCreateWithoutAiChatsInput = {
    id: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatarUrl?: string | null
    lastActiveAt?: Date | string
    system_admin?: boolean
    grantBookmarks?: GrantBookmarkCreateNestedManyWithoutUserInput
    organization: OrganizationCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAiChatsInput = {
    id: string
    email: string
    name?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    avatarUrl?: string | null
    lastActiveAt?: Date | string
    organizationId: string
    system_admin?: boolean
    grantBookmarks?: GrantBookmarkUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAiChatsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAiChatsInput, UserUncheckedCreateWithoutAiChatsInput>
  }

  export type OrganizationCreateWithoutAiChatsInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    applications?: ApplicationCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisCreateNestedManyWithoutOrganizationInput
    user?: UserCreateNestedOneWithoutOrganizationInput
    schoolDistrict?: SchoolDistrictCreateNestedOneWithoutOrganizationsInput
  }

  export type OrganizationUncheckedCreateWithoutAiChatsInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
    schoolDistrictId?: string | null
    applications?: ApplicationUncheckedCreateNestedManyWithoutOrganizationInput
    grantBookmarks?: GrantBookmarkUncheckedCreateNestedManyWithoutOrganizationInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedCreateNestedManyWithoutOrganizationInput
    user?: UserUncheckedCreateNestedOneWithoutOrganizationInput
  }

  export type OrganizationCreateOrConnectWithoutAiChatsInput = {
    where: OrganizationWhereUniqueInput
    create: XOR<OrganizationCreateWithoutAiChatsInput, OrganizationUncheckedCreateWithoutAiChatsInput>
  }

  export type AiChatMessageUpsertWithWhereUniqueWithoutChatInput = {
    where: AiChatMessageWhereUniqueInput
    update: XOR<AiChatMessageUpdateWithoutChatInput, AiChatMessageUncheckedUpdateWithoutChatInput>
    create: XOR<AiChatMessageCreateWithoutChatInput, AiChatMessageUncheckedCreateWithoutChatInput>
  }

  export type AiChatMessageUpdateWithWhereUniqueWithoutChatInput = {
    where: AiChatMessageWhereUniqueInput
    data: XOR<AiChatMessageUpdateWithoutChatInput, AiChatMessageUncheckedUpdateWithoutChatInput>
  }

  export type AiChatMessageUpdateManyWithWhereWithoutChatInput = {
    where: AiChatMessageScalarWhereInput
    data: XOR<AiChatMessageUpdateManyMutationInput, AiChatMessageUncheckedUpdateManyWithoutChatInput>
  }

  export type AiChatMessageScalarWhereInput = {
    AND?: AiChatMessageScalarWhereInput | AiChatMessageScalarWhereInput[]
    OR?: AiChatMessageScalarWhereInput[]
    NOT?: AiChatMessageScalarWhereInput | AiChatMessageScalarWhereInput[]
    id?: StringFilter<"AiChatMessage"> | string
    role?: EnumMessageRoleFilter<"AiChatMessage"> | $Enums.MessageRole
    content?: StringFilter<"AiChatMessage"> | string
    metadata?: JsonNullableFilter<"AiChatMessage">
    createdAt?: DateTimeFilter<"AiChatMessage"> | Date | string
    chatId?: StringFilter<"AiChatMessage"> | string
  }

  export type ApplicationUpsertWithoutAiChatsInput = {
    update: XOR<ApplicationUpdateWithoutAiChatsInput, ApplicationUncheckedUpdateWithoutAiChatsInput>
    create: XOR<ApplicationCreateWithoutAiChatsInput, ApplicationUncheckedCreateWithoutAiChatsInput>
    where?: ApplicationWhereInput
  }

  export type ApplicationUpdateToOneWithWhereWithoutAiChatsInput = {
    where?: ApplicationWhereInput
    data: XOR<ApplicationUpdateWithoutAiChatsInput, ApplicationUncheckedUpdateWithoutAiChatsInput>
  }

  export type ApplicationUpdateWithoutAiChatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastEditedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organization?: OrganizationUpdateOneRequiredWithoutApplicationsNestedInput
  }

  export type ApplicationUncheckedUpdateWithoutAiChatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    organizationId?: StringFieldUpdateOperationsInput | string
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastEditedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutAiChatsInput = {
    update: XOR<UserUpdateWithoutAiChatsInput, UserUncheckedUpdateWithoutAiChatsInput>
    create: XOR<UserCreateWithoutAiChatsInput, UserUncheckedCreateWithoutAiChatsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAiChatsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAiChatsInput, UserUncheckedUpdateWithoutAiChatsInput>
  }

  export type UserUpdateWithoutAiChatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
    grantBookmarks?: GrantBookmarkUpdateManyWithoutUserNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAiChatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    lastActiveAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    system_admin?: BoolFieldUpdateOperationsInput | boolean
    grantBookmarks?: GrantBookmarkUncheckedUpdateManyWithoutUserNestedInput
  }

  export type OrganizationUpsertWithoutAiChatsInput = {
    update: XOR<OrganizationUpdateWithoutAiChatsInput, OrganizationUncheckedUpdateWithoutAiChatsInput>
    create: XOR<OrganizationCreateWithoutAiChatsInput, OrganizationUncheckedCreateWithoutAiChatsInput>
    where?: OrganizationWhereInput
  }

  export type OrganizationUpdateToOneWithWhereWithoutAiChatsInput = {
    where?: OrganizationWhereInput
    data: XOR<OrganizationUpdateWithoutAiChatsInput, OrganizationUncheckedUpdateWithoutAiChatsInput>
  }

  export type OrganizationUpdateWithoutAiChatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applications?: ApplicationUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUpdateManyWithoutOrganizationNestedInput
    user?: UserUpdateOneWithoutOrganizationNestedInput
    schoolDistrict?: SchoolDistrictUpdateOneWithoutOrganizationsNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutAiChatsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schoolDistrictId?: NullableStringFieldUpdateOperationsInput | string | null
    applications?: ApplicationUncheckedUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUncheckedUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedUpdateManyWithoutOrganizationNestedInput
    user?: UserUncheckedUpdateOneWithoutOrganizationNestedInput
  }

  export type AiChatCreateWithoutMessagesInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    application?: ApplicationCreateNestedOneWithoutAiChatsInput
    user: UserCreateNestedOneWithoutAiChatsInput
    organization: OrganizationCreateNestedOneWithoutAiChatsInput
  }

  export type AiChatUncheckedCreateWithoutMessagesInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
    userId: string
    applicationId?: string | null
  }

  export type AiChatCreateOrConnectWithoutMessagesInput = {
    where: AiChatWhereUniqueInput
    create: XOR<AiChatCreateWithoutMessagesInput, AiChatUncheckedCreateWithoutMessagesInput>
  }

  export type AiChatUpsertWithoutMessagesInput = {
    update: XOR<AiChatUpdateWithoutMessagesInput, AiChatUncheckedUpdateWithoutMessagesInput>
    create: XOR<AiChatCreateWithoutMessagesInput, AiChatUncheckedCreateWithoutMessagesInput>
    where?: AiChatWhereInput
  }

  export type AiChatUpdateToOneWithWhereWithoutMessagesInput = {
    where?: AiChatWhereInput
    data: XOR<AiChatUpdateWithoutMessagesInput, AiChatUncheckedUpdateWithoutMessagesInput>
  }

  export type AiChatUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    application?: ApplicationUpdateOneWithoutAiChatsNestedInput
    user?: UserUpdateOneRequiredWithoutAiChatsNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutAiChatsNestedInput
  }

  export type AiChatUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AiChatCreateManyUserInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
    applicationId?: string | null
  }

  export type GrantBookmarkCreateManyUserInput = {
    id?: string
    notes?: string | null
    createdAt?: Date | string
    organizationId: string
    opportunityId: number
  }

  export type AiChatUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: AiChatMessageUpdateManyWithoutChatNestedInput
    application?: ApplicationUpdateOneWithoutAiChatsNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutAiChatsNestedInput
  }

  export type AiChatUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    messages?: AiChatMessageUncheckedUpdateManyWithoutChatNestedInput
  }

  export type AiChatUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type GrantBookmarkUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    organization?: OrganizationUpdateOneRequiredWithoutGrantBookmarksNestedInput
  }

  export type GrantBookmarkUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantBookmarkUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type AiChatCreateManyOrganizationInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    userId: string
    applicationId?: string | null
  }

  export type ApplicationCreateManyOrganizationInput = {
    id?: string
    opportunityId: number
    status?: $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: string | null
    title?: string | null
    notes?: string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    submittedAt?: Date | string | null
    lastEditedAt?: Date | string
  }

  export type GrantBookmarkCreateManyOrganizationInput = {
    id?: string
    notes?: string | null
    createdAt?: Date | string
    userId: string
    opportunityId: number
  }

  export type GrantEligibilityAnalysisCreateManyOrganizationInput = {
    id?: string
    matchScore: number
    goNoGo: $Enums.GoNoGoDecision
    rationale: string
    risks?: string | null
    confidence?: number | null
    createdAt?: Date | string
    opportunityId: number
  }

  export type AiChatUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: AiChatMessageUpdateManyWithoutChatNestedInput
    application?: ApplicationUpdateOneWithoutAiChatsNestedInput
    user?: UserUpdateOneRequiredWithoutAiChatsNestedInput
  }

  export type AiChatUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
    messages?: AiChatMessageUncheckedUpdateManyWithoutChatNestedInput
  }

  export type AiChatUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    applicationId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApplicationUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastEditedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastEditedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUncheckedUpdateManyWithoutApplicationNestedInput
  }

  export type ApplicationUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    content?: NullableJsonNullValueInput | InputJsonValue
    contentHtml?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    documents?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    submittedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastEditedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GrantBookmarkUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opportunityId?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutGrantBookmarksNestedInput
  }

  export type GrantBookmarkUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantBookmarkUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantEligibilityAnalysisUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchScore?: IntFieldUpdateOperationsInput | number
    goNoGo?: EnumGoNoGoDecisionFieldUpdateOperationsInput | $Enums.GoNoGoDecision
    rationale?: StringFieldUpdateOperationsInput | string
    risks?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantEligibilityAnalysisUncheckedUpdateWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchScore?: IntFieldUpdateOperationsInput | number
    goNoGo?: EnumGoNoGoDecisionFieldUpdateOperationsInput | $Enums.GoNoGoDecision
    rationale?: StringFieldUpdateOperationsInput | string
    risks?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type GrantEligibilityAnalysisUncheckedUpdateManyWithoutOrganizationInput = {
    id?: StringFieldUpdateOperationsInput | string
    matchScore?: IntFieldUpdateOperationsInput | number
    goNoGo?: EnumGoNoGoDecisionFieldUpdateOperationsInput | $Enums.GoNoGoDecision
    rationale?: StringFieldUpdateOperationsInput | string
    risks?: NullableStringFieldUpdateOperationsInput | string | null
    confidence?: NullableFloatFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    opportunityId?: IntFieldUpdateOperationsInput | number
  }

  export type OrganizationCreateManySchoolDistrictInput = {
    id?: string
    name: string
    slug: string
    type?: $Enums.OrganizationType
    role?: $Enums.OrganizationRole
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationUpdateWithoutSchoolDistrictInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUpdateManyWithoutOrganizationNestedInput
    user?: UserUpdateOneWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateWithoutSchoolDistrictInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    aiChats?: AiChatUncheckedUpdateManyWithoutOrganizationNestedInput
    applications?: ApplicationUncheckedUpdateManyWithoutOrganizationNestedInput
    grantBookmarks?: GrantBookmarkUncheckedUpdateManyWithoutOrganizationNestedInput
    eligibilityAnalyses?: GrantEligibilityAnalysisUncheckedUpdateManyWithoutOrganizationNestedInput
    user?: UserUncheckedUpdateOneWithoutOrganizationNestedInput
  }

  export type OrganizationUncheckedUpdateManyWithoutSchoolDistrictInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumOrganizationTypeFieldUpdateOperationsInput | $Enums.OrganizationType
    role?: EnumOrganizationRoleFieldUpdateOperationsInput | $Enums.OrganizationRole
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiChatCreateManyApplicationInput = {
    id?: string
    title?: string | null
    context: $Enums.AiChatContext
    createdAt?: Date | string
    updatedAt?: Date | string
    organizationId: string
    userId: string
  }

  export type AiChatUpdateWithoutApplicationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: AiChatMessageUpdateManyWithoutChatNestedInput
    user?: UserUpdateOneRequiredWithoutAiChatsNestedInput
    organization?: OrganizationUpdateOneRequiredWithoutAiChatsNestedInput
  }

  export type AiChatUncheckedUpdateWithoutApplicationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    messages?: AiChatMessageUncheckedUpdateManyWithoutChatNestedInput
  }

  export type AiChatUncheckedUpdateManyWithoutApplicationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    context?: EnumAiChatContextFieldUpdateOperationsInput | $Enums.AiChatContext
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    organizationId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type AiChatMessageCreateManyChatInput = {
    id?: string
    role: $Enums.MessageRole
    content: string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AiChatMessageUpdateWithoutChatInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMessageRoleFieldUpdateOperationsInput | $Enums.MessageRole
    content?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiChatMessageUncheckedUpdateWithoutChatInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMessageRoleFieldUpdateOperationsInput | $Enums.MessageRole
    content?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AiChatMessageUncheckedUpdateManyWithoutChatInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: EnumMessageRoleFieldUpdateOperationsInput | $Enums.MessageRole
    content?: StringFieldUpdateOperationsInput | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}