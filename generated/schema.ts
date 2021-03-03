// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Transaction extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Transaction entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Transaction entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Transaction", id.toString(), this);
  }

  static load(id: string): Transaction | null {
    return store.get("Transaction", id) as Transaction | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get event(): string {
    let value = this.get("event");
    return value.toString();
  }

  set event(value: string) {
    this.set("event", Value.fromString(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get gasPrice(): BigInt {
    let value = this.get("gasPrice");
    return value.toBigInt();
  }

  set gasPrice(value: BigInt) {
    this.set("gasPrice", Value.fromBigInt(value));
  }

  get gasSent(): BigInt {
    let value = this.get("gasSent");
    return value.toBigInt();
  }

  set gasSent(value: BigInt) {
    this.set("gasSent", Value.fromBigInt(value));
  }

  get hash(): Bytes {
    let value = this.get("hash");
    return value.toBytes();
  }

  set hash(value: Bytes) {
    this.set("hash", Value.fromBytes(value));
  }

  get index(): BigInt {
    let value = this.get("index");
    return value.toBigInt();
  }

  set index(value: BigInt) {
    this.set("index", Value.fromBigInt(value));
  }

  get to(): Bytes {
    let value = this.get("to");
    return value.toBytes();
  }

  set to(value: Bytes) {
    this.set("to", Value.fromBytes(value));
  }

  get value(): BigInt {
    let value = this.get("value");
    return value.toBigInt();
  }

  set value(value: BigInt) {
    this.set("value", Value.fromBigInt(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get gasLimit(): BigInt {
    let value = this.get("gasLimit");
    return value.toBigInt();
  }

  set gasLimit(value: BigInt) {
    this.set("gasLimit", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }
}

export class Token extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Token entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Token entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Token", id.toString(), this);
  }

  static load(id: string): Token | null {
    return store.get("Token", id) as Token | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get decimals(): i32 {
    let value = this.get("decimals");
    return value.toI32();
  }

  set decimals(value: i32) {
    this.set("decimals", Value.fromI32(value));
  }

  get name(): string {
    let value = this.get("name");
    return value.toString();
  }

  set name(value: string) {
    this.set("name", Value.fromString(value));
  }

  get symbol(): string {
    let value = this.get("symbol");
    return value.toString();
  }

  set symbol(value: string) {
    this.set("symbol", Value.fromString(value));
  }
}

export class Vault extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Vault entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Vault entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Vault", id.toString(), this);
  }

  static load(id: string): Vault | null {
    return store.get("Vault", id) as Vault | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get token(): string {
    let value = this.get("token");
    return value.toString();
  }

  set token(value: string) {
    this.set("token", Value.fromString(value));
  }

  get shareToken(): string {
    let value = this.get("shareToken");
    return value.toString();
  }

  set shareToken(value: string) {
    this.set("shareToken", Value.fromString(value));
  }

  get classification(): string {
    let value = this.get("classification");
    return value.toString();
  }

  set classification(value: string) {
    this.set("classification", Value.fromString(value));
  }

  get latestUpdate(): string | null {
    let value = this.get("latestUpdate");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set latestUpdate(value: string | null) {
    if (value === null) {
      this.unset("latestUpdate");
    } else {
      this.set("latestUpdate", Value.fromString(value as string));
    }
  }

  get historicalUpdates(): Array<string> {
    let value = this.get("historicalUpdates");
    return value.toStringArray();
  }

  set historicalUpdates(value: Array<string>) {
    this.set("historicalUpdates", Value.fromStringArray(value));
  }

  get strategies(): Array<string> {
    let value = this.get("strategies");
    return value.toStringArray();
  }

  set strategies(value: Array<string>) {
    this.set("strategies", Value.fromStringArray(value));
  }

  get deposits(): Array<string> {
    let value = this.get("deposits");
    return value.toStringArray();
  }

  set deposits(value: Array<string>) {
    this.set("deposits", Value.fromStringArray(value));
  }

  get withdrawals(): Array<string> {
    let value = this.get("withdrawals");
    return value.toStringArray();
  }

  set withdrawals(value: Array<string>) {
    this.set("withdrawals", Value.fromStringArray(value));
  }

  get transfers(): Array<string> {
    let value = this.get("transfers");
    return value.toStringArray();
  }

  set transfers(value: Array<string>) {
    this.set("transfers", Value.fromStringArray(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }

  get tags(): Array<string> {
    let value = this.get("tags");
    return value.toStringArray();
  }

  set tags(value: Array<string>) {
    this.set("tags", Value.fromStringArray(value));
  }

  get balanceTokens(): BigInt {
    let value = this.get("balanceTokens");
    return value.toBigInt();
  }

  set balanceTokens(value: BigInt) {
    this.set("balanceTokens", Value.fromBigInt(value));
  }

  get balanceTokensIdle(): BigInt {
    let value = this.get("balanceTokensIdle");
    return value.toBigInt();
  }

  set balanceTokensIdle(value: BigInt) {
    this.set("balanceTokensIdle", Value.fromBigInt(value));
  }

  get balanceTokensInvested(): BigInt {
    let value = this.get("balanceTokensInvested");
    return value.toBigInt();
  }

  set balanceTokensInvested(value: BigInt) {
    this.set("balanceTokensInvested", Value.fromBigInt(value));
  }

  get tokensDepositLimit(): BigInt {
    let value = this.get("tokensDepositLimit");
    return value.toBigInt();
  }

  set tokensDepositLimit(value: BigInt) {
    this.set("tokensDepositLimit", Value.fromBigInt(value));
  }

  get sharesSupply(): BigInt {
    let value = this.get("sharesSupply");
    return value.toBigInt();
  }

  set sharesSupply(value: BigInt) {
    this.set("sharesSupply", Value.fromBigInt(value));
  }

  get managementFeeBps(): i32 {
    let value = this.get("managementFeeBps");
    return value.toI32();
  }

  set managementFeeBps(value: i32) {
    this.set("managementFeeBps", Value.fromI32(value));
  }

  get performanceFeeBps(): i32 {
    let value = this.get("performanceFeeBps");
    return value.toI32();
  }

  set performanceFeeBps(value: i32) {
    this.set("performanceFeeBps", Value.fromI32(value));
  }

  get activation(): BigInt {
    let value = this.get("activation");
    return value.toBigInt();
  }

  set activation(value: BigInt) {
    this.set("activation", Value.fromBigInt(value));
  }

  get apiVersion(): string {
    let value = this.get("apiVersion");
    return value.toString();
  }

  set apiVersion(value: string) {
    this.set("apiVersion", Value.fromString(value));
  }
}

export class VaultUpdate extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save VaultUpdate entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save VaultUpdate entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("VaultUpdate", id.toString(), this);
  }

  static load(id: string): VaultUpdate | null {
    return store.get("VaultUpdate", id) as VaultUpdate | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get tokensDeposited(): BigInt {
    let value = this.get("tokensDeposited");
    return value.toBigInt();
  }

  set tokensDeposited(value: BigInt) {
    this.set("tokensDeposited", Value.fromBigInt(value));
  }

  get tokensWithdrawn(): BigInt {
    let value = this.get("tokensWithdrawn");
    return value.toBigInt();
  }

  set tokensWithdrawn(value: BigInt) {
    this.set("tokensWithdrawn", Value.fromBigInt(value));
  }

  get sharesMinted(): BigInt {
    let value = this.get("sharesMinted");
    return value.toBigInt();
  }

  set sharesMinted(value: BigInt) {
    this.set("sharesMinted", Value.fromBigInt(value));
  }

  get sharesBurnt(): BigInt {
    let value = this.get("sharesBurnt");
    return value.toBigInt();
  }

  set sharesBurnt(value: BigInt) {
    this.set("sharesBurnt", Value.fromBigInt(value));
  }

  get pricePerShare(): BigInt {
    let value = this.get("pricePerShare");
    return value.toBigInt();
  }

  set pricePerShare(value: BigInt) {
    this.set("pricePerShare", Value.fromBigInt(value));
  }

  get returnsGenerated(): BigInt {
    let value = this.get("returnsGenerated");
    return value.toBigInt();
  }

  set returnsGenerated(value: BigInt) {
    this.set("returnsGenerated", Value.fromBigInt(value));
  }

  get totalFees(): BigInt {
    let value = this.get("totalFees");
    return value.toBigInt();
  }

  set totalFees(value: BigInt) {
    this.set("totalFees", Value.fromBigInt(value));
  }

  get managementFees(): BigInt {
    let value = this.get("managementFees");
    return value.toBigInt();
  }

  set managementFees(value: BigInt) {
    this.set("managementFees", Value.fromBigInt(value));
  }

  get performanceFees(): BigInt {
    let value = this.get("performanceFees");
    return value.toBigInt();
  }

  set performanceFees(value: BigInt) {
    this.set("performanceFees", Value.fromBigInt(value));
  }
}

export class Account extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Account entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Account entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Account", id.toString(), this);
  }

  static load(id: string): Account | null {
    return store.get("Account", id) as Account | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get deposits(): Array<string> {
    let value = this.get("deposits");
    return value.toStringArray();
  }

  set deposits(value: Array<string>) {
    this.set("deposits", Value.fromStringArray(value));
  }

  get withdrawals(): Array<string> {
    let value = this.get("withdrawals");
    return value.toStringArray();
  }

  set withdrawals(value: Array<string>) {
    this.set("withdrawals", Value.fromStringArray(value));
  }

  get vaultPositions(): Array<string> {
    let value = this.get("vaultPositions");
    return value.toStringArray();
  }

  set vaultPositions(value: Array<string>) {
    this.set("vaultPositions", Value.fromStringArray(value));
  }

  get sharesReceived(): Array<string> {
    let value = this.get("sharesReceived");
    return value.toStringArray();
  }

  set sharesReceived(value: Array<string>) {
    this.set("sharesReceived", Value.fromStringArray(value));
  }

  get sharesSent(): Array<string> {
    let value = this.get("sharesSent");
    return value.toStringArray();
  }

  set sharesSent(value: Array<string>) {
    this.set("sharesSent", Value.fromStringArray(value));
  }
}

export class Deposit extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Deposit entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Deposit entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Deposit", id.toString(), this);
  }

  static load(id: string): Deposit | null {
    return store.get("Deposit", id) as Deposit | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get account(): string {
    let value = this.get("account");
    return value.toString();
  }

  set account(value: string) {
    this.set("account", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get tokenAmount(): BigInt {
    let value = this.get("tokenAmount");
    return value.toBigInt();
  }

  set tokenAmount(value: BigInt) {
    this.set("tokenAmount", Value.fromBigInt(value));
  }

  get sharesMinted(): BigInt {
    let value = this.get("sharesMinted");
    return value.toBigInt();
  }

  set sharesMinted(value: BigInt) {
    this.set("sharesMinted", Value.fromBigInt(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }

  get vaultUpdate(): string {
    let value = this.get("vaultUpdate");
    return value.toString();
  }

  set vaultUpdate(value: string) {
    this.set("vaultUpdate", Value.fromString(value));
  }
}

export class Withdrawal extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Withdrawal entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Withdrawal entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Withdrawal", id.toString(), this);
  }

  static load(id: string): Withdrawal | null {
    return store.get("Withdrawal", id) as Withdrawal | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get account(): string {
    let value = this.get("account");
    return value.toString();
  }

  set account(value: string) {
    this.set("account", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get tokenAmount(): BigInt {
    let value = this.get("tokenAmount");
    return value.toBigInt();
  }

  set tokenAmount(value: BigInt) {
    this.set("tokenAmount", Value.fromBigInt(value));
  }

  get sharesBurnt(): BigInt {
    let value = this.get("sharesBurnt");
    return value.toBigInt();
  }

  set sharesBurnt(value: BigInt) {
    this.set("sharesBurnt", Value.fromBigInt(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }

  get vaultUpdate(): string {
    let value = this.get("vaultUpdate");
    return value.toString();
  }

  set vaultUpdate(value: string) {
    this.set("vaultUpdate", Value.fromString(value));
  }
}

export class Transfer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Transfer entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Transfer entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Transfer", id.toString(), this);
  }

  static load(id: string): Transfer | null {
    return store.get("Transfer", id) as Transfer | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get from(): string {
    let value = this.get("from");
    return value.toString();
  }

  set from(value: string) {
    this.set("from", Value.fromString(value));
  }

  get to(): string {
    let value = this.get("to");
    return value.toString();
  }

  set to(value: string) {
    this.set("to", Value.fromString(value));
  }

  get shareToken(): string {
    let value = this.get("shareToken");
    return value.toString();
  }

  set shareToken(value: string) {
    this.set("shareToken", Value.fromString(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get token(): string {
    let value = this.get("token");
    return value.toString();
  }

  set token(value: string) {
    this.set("token", Value.fromString(value));
  }

  get tokenAmount(): BigInt {
    let value = this.get("tokenAmount");
    return value.toBigInt();
  }

  set tokenAmount(value: BigInt) {
    this.set("tokenAmount", Value.fromBigInt(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }
}

export class AccountVaultPosition extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id !== null,
      "Cannot save AccountVaultPosition entity without an ID"
    );
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save AccountVaultPosition entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("AccountVaultPosition", id.toString(), this);
  }

  static load(id: string): AccountVaultPosition | null {
    return store.get("AccountVaultPosition", id) as AccountVaultPosition | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get account(): string {
    let value = this.get("account");
    return value.toString();
  }

  set account(value: string) {
    this.set("account", Value.fromString(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }

  get latestUpdate(): string | null {
    let value = this.get("latestUpdate");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set latestUpdate(value: string | null) {
    if (value === null) {
      this.unset("latestUpdate");
    } else {
      this.set("latestUpdate", Value.fromString(value as string));
    }
  }

  get updates(): Array<string> {
    let value = this.get("updates");
    return value.toStringArray();
  }

  set updates(value: Array<string>) {
    this.set("updates", Value.fromStringArray(value));
  }

  get balanceShares(): BigInt {
    let value = this.get("balanceShares");
    return value.toBigInt();
  }

  set balanceShares(value: BigInt) {
    this.set("balanceShares", Value.fromBigInt(value));
  }

  get balanceTokens(): BigInt {
    let value = this.get("balanceTokens");
    return value.toBigInt();
  }

  set balanceTokens(value: BigInt) {
    this.set("balanceTokens", Value.fromBigInt(value));
  }
}

export class AccountVaultPositionUpdate extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(
      id !== null,
      "Cannot save AccountVaultPositionUpdate entity without an ID"
    );
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save AccountVaultPositionUpdate entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("AccountVaultPositionUpdate", id.toString(), this);
  }

  static load(id: string): AccountVaultPositionUpdate | null {
    return store.get(
      "AccountVaultPositionUpdate",
      id
    ) as AccountVaultPositionUpdate | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get accountVaultPosition(): string {
    let value = this.get("accountVaultPosition");
    return value.toString();
  }

  set accountVaultPosition(value: string) {
    this.set("accountVaultPosition", Value.fromString(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }

  get deposits(): BigInt {
    let value = this.get("deposits");
    return value.toBigInt();
  }

  set deposits(value: BigInt) {
    this.set("deposits", Value.fromBigInt(value));
  }

  get withdrawals(): BigInt {
    let value = this.get("withdrawals");
    return value.toBigInt();
  }

  set withdrawals(value: BigInt) {
    this.set("withdrawals", Value.fromBigInt(value));
  }

  get sharesMinted(): BigInt {
    let value = this.get("sharesMinted");
    return value.toBigInt();
  }

  set sharesMinted(value: BigInt) {
    this.set("sharesMinted", Value.fromBigInt(value));
  }

  get sharesBurnt(): BigInt {
    let value = this.get("sharesBurnt");
    return value.toBigInt();
  }

  set sharesBurnt(value: BigInt) {
    this.set("sharesBurnt", Value.fromBigInt(value));
  }

  get tokensSent(): BigInt {
    let value = this.get("tokensSent");
    return value.toBigInt();
  }

  set tokensSent(value: BigInt) {
    this.set("tokensSent", Value.fromBigInt(value));
  }

  get tokensReceived(): BigInt {
    let value = this.get("tokensReceived");
    return value.toBigInt();
  }

  set tokensReceived(value: BigInt) {
    this.set("tokensReceived", Value.fromBigInt(value));
  }

  get sharesSent(): BigInt {
    let value = this.get("sharesSent");
    return value.toBigInt();
  }

  set sharesSent(value: BigInt) {
    this.set("sharesSent", Value.fromBigInt(value));
  }

  get sharesReceived(): BigInt {
    let value = this.get("sharesReceived");
    return value.toBigInt();
  }

  set sharesReceived(value: BigInt) {
    this.set("sharesReceived", Value.fromBigInt(value));
  }

  get vaultUpdate(): string {
    let value = this.get("vaultUpdate");
    return value.toString();
  }

  set vaultUpdate(value: string) {
    this.set("vaultUpdate", Value.fromString(value));
  }
}

export class Strategy extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Strategy entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Strategy entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Strategy", id.toString(), this);
  }

  static load(id: string): Strategy | null {
    return store.get("Strategy", id) as Strategy | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get debtLimit(): BigInt {
    let value = this.get("debtLimit");
    return value.toBigInt();
  }

  set debtLimit(value: BigInt) {
    this.set("debtLimit", Value.fromBigInt(value));
  }

  get rateLimit(): BigInt {
    let value = this.get("rateLimit");
    return value.toBigInt();
  }

  set rateLimit(value: BigInt) {
    this.set("rateLimit", Value.fromBigInt(value));
  }

  get performanceFeeBps(): i32 {
    let value = this.get("performanceFeeBps");
    return value.toI32();
  }

  set performanceFeeBps(value: i32) {
    this.set("performanceFeeBps", Value.fromI32(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get reports(): Array<string> {
    let value = this.get("reports");
    return value.toStringArray();
  }

  set reports(value: Array<string>) {
    this.set("reports", Value.fromStringArray(value));
  }

  get latestReport(): string | null {
    let value = this.get("latestReport");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toString();
    }
  }

  set latestReport(value: string | null) {
    if (value === null) {
      this.unset("latestReport");
    } else {
      this.set("latestReport", Value.fromString(value as string));
    }
  }

  get harvests(): Array<string> {
    let value = this.get("harvests");
    return value.toStringArray();
  }

  set harvests(value: Array<string>) {
    this.set("harvests", Value.fromStringArray(value));
  }
}

export class StrategyReport extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save StrategyReport entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save StrategyReport entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("StrategyReport", id.toString(), this);
  }

  static load(id: string): StrategyReport | null {
    return store.get("StrategyReport", id) as StrategyReport | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get transaction(): string {
    let value = this.get("transaction");
    return value.toString();
  }

  set transaction(value: string) {
    this.set("transaction", Value.fromString(value));
  }

  get strategy(): string {
    let value = this.get("strategy");
    return value.toString();
  }

  set strategy(value: string) {
    this.set("strategy", Value.fromString(value));
  }

  get gain(): BigInt {
    let value = this.get("gain");
    return value.toBigInt();
  }

  set gain(value: BigInt) {
    this.set("gain", Value.fromBigInt(value));
  }

  get loss(): BigInt {
    let value = this.get("loss");
    return value.toBigInt();
  }

  set loss(value: BigInt) {
    this.set("loss", Value.fromBigInt(value));
  }

  get totalGain(): BigInt {
    let value = this.get("totalGain");
    return value.toBigInt();
  }

  set totalGain(value: BigInt) {
    this.set("totalGain", Value.fromBigInt(value));
  }

  get totalLoss(): BigInt {
    let value = this.get("totalLoss");
    return value.toBigInt();
  }

  set totalLoss(value: BigInt) {
    this.set("totalLoss", Value.fromBigInt(value));
  }

  get totalDebt(): BigInt {
    let value = this.get("totalDebt");
    return value.toBigInt();
  }

  set totalDebt(value: BigInt) {
    this.set("totalDebt", Value.fromBigInt(value));
  }

  get debtAdded(): BigInt {
    let value = this.get("debtAdded");
    return value.toBigInt();
  }

  set debtAdded(value: BigInt) {
    this.set("debtAdded", Value.fromBigInt(value));
  }

  get debtLimit(): BigInt {
    let value = this.get("debtLimit");
    return value.toBigInt();
  }

  set debtLimit(value: BigInt) {
    this.set("debtLimit", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }
}

export class Harvest extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Harvest entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Harvest entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Harvest", id.toString(), this);
  }

  static load(id: string): Harvest | null {
    return store.get("Harvest", id) as Harvest | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get vault(): string {
    let value = this.get("vault");
    return value.toString();
  }

  set vault(value: string) {
    this.set("vault", Value.fromString(value));
  }

  get strategy(): string {
    let value = this.get("strategy");
    return value.toString();
  }

  set strategy(value: string) {
    this.set("strategy", Value.fromString(value));
  }

  get harvester(): Bytes {
    let value = this.get("harvester");
    return value.toBytes();
  }

  set harvester(value: Bytes) {
    this.set("harvester", Value.fromBytes(value));
  }

  get gain(): BigInt {
    let value = this.get("gain");
    return value.toBigInt();
  }

  set gain(value: BigInt) {
    this.set("gain", Value.fromBigInt(value));
  }

  get loss(): BigInt {
    let value = this.get("loss");
    return value.toBigInt();
  }

  set loss(value: BigInt) {
    this.set("loss", Value.fromBigInt(value));
  }

  get debtPayment(): BigInt {
    let value = this.get("debtPayment");
    return value.toBigInt();
  }

  set debtPayment(value: BigInt) {
    this.set("debtPayment", Value.fromBigInt(value));
  }

  get debtOutstanding(): BigInt {
    let value = this.get("debtOutstanding");
    return value.toBigInt();
  }

  set debtOutstanding(value: BigInt) {
    this.set("debtOutstanding", Value.fromBigInt(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }
}
