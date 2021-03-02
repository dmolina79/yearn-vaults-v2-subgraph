import { Address, ethereum, BigInt, log } from "@graphprotocol/graph-ts";
import {
  StrategyAdded as StrategyAddedEvent,
  StrategyReported as StrategyReportedEvent,
  Deposit1Call as DepositCall,
  Transfer as TransferEvent,
  Withdraw1Call as WithdrawCall,
  Vault as VaultContract,
  Deposit2Call,
  Deposit1Call,
} from "../../generated/Registry/Vault";
import {
  getOrCreateDeposit,
  internalMapTransfer,
  internalMapWithdrawal,
} from "../utils/vaultBalanceUpdates";
import { getOrCreateVault } from "../utils/vault";
import { createStrategy, reportStrategy } from "../utils/strategy";
import { getOrCreateTransactionFromCall, getOrCreateTransactionFromEvent } from "../utils/transaction";


export function addStrategyToVault(
  transactionId: string,
  vaultAddress: Address,
  strategy: Address,
  debtLimit: BigInt,
  performanceFee: BigInt,
  rateLimit: BigInt,
  event: ethereum.Event,
): void {
  let vault = getOrCreateVault(vaultAddress, false)
  if(vault !== null) {
    createStrategy(
      transactionId,
      strategy,
      vaultAddress,
      debtLimit,
      rateLimit,
      performanceFee,
      event
    )
  }
}

export function handleStrategyAdded(event: StrategyAddedEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, "StrategyAddedEvent")

  // TODO: refactor to createStrategy since derived links vault + strat
  addStrategyToVault(
    ethTransaction.id,
    event.address,
    event.params.strategy,
    event.params.debtLimit,
    event.params.performanceFee,
    event.params.rateLimit,
    event
  )
}

export function handleStrategyReported(event: StrategyReportedEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, "StrategyReportedEvent")
  reportStrategy(
    ethTransaction.id,
    event.params.strategy.toHexString(),
    event.params.gain,
    event.params.loss,
    event.params.totalGain,
    event.params.totalLoss,
    event.params.totalDebt,
    event.params.debtAdded,
    event.params.debtLimit,
    event,
  )
}


//  VAULT BALANCE UPDATES

export function handleDeposit(call: DepositCall): void {
  log.debug('[Vault mappings] Handle deposit', [])
  // log.warning('[Vault mappings] Handle deposit - before timestamp', [])
  // log.warning('[Vault mappings] Handle deposit - timestamp {}', [call.block.timestamp.toString()])
  // log.warning('[Vault mappings] Handle deposit - after timestamp', [])
  log.warning('[Vault mappings] Handle deposit - before create from call {}', [call.transaction.hash.toHexString()])
  // getOrCreateTransactionFromCall(
  //   call
  // )
  // log.warning('[Vault mappings] Handle deposit - after create from call', [])
  // let vaultContract = VaultContract.bind(call.to)
  // getOrCreateDeposit(
  //   call.transaction.hash,
  //   call.transaction.index,
  //   call.to,
  //   call.from,
  //   call.inputs._amount,
  //   vaultContract.totalAssets(),
  //   vaultContract.totalSupply(),
  //   vaultContract.pricePerShare(),
  //   call.block.timestamp,
  //   call.block.number
  // );
}

export function handleDepositWithAmount(call: Deposit1Call): void {
  log.debug('[Vault mappings] Handle deposit with amount', [])
  // log.warning('[Vault mappings] Handle deposit with amount - before timestamp', [])
  // log.warning('[Vault mappings] Handle deposit with amount - timestamp {}', [call.block.timestamp.toString()])
  // log.warning('[Vault mappings] Handle deposit with amount - after timestamp', [])
  log.warning('[Vault mappings] Handle deposit with amount - before create from call {}', [call.transaction.hash.toHexString()])
  // getOrCreateTransactionFromCall(
  //   call
  // )
  // log.warning('[Vault mappings] Handle deposit with amount - after create from call', [])
}

export function handleDepositWithAmountAndRecipient(call: Deposit2Call): void {
  log.debug('[Vault mappings] Handle deposit with amount and recipient', [])
  // log.warning('[Vault mappings] Handle deposit with amount and recipient - before timestamp', [])
  // log.warning('[Vault mappings] Handle deposit with amount and recipient - timestamp {}', [call.block.timestamp.toString()])
  // log.warning('[Vault mappings] Handle deposit with amount and recipient - after timestamp', [])
  log.warning('[Vault mappings] Handle deposit with amount and recipient - before create from call {}', [call.transaction.hash.toHexString()])
  // getOrCreateTransactionFromCall(
  //   call
  // )
  // log.warning('[Vault mappings] Handle deposit with amount and recipient - after create from call', [])
}

export function handleWithdrawal(call: WithdrawCall): void {
  let vaultContract = VaultContract.bind(call.to)
 internalMapWithdrawal(
  call.transaction.hash,
  call.transaction.index,
  call.to,
  call.from,
  call.inputs._shares,
  vaultContract.totalAssets(),
  vaultContract.totalSupply(),
  vaultContract.pricePerShare(),
  call.block.timestamp,
  call.block.number
 );
}

export function handleTransfer(event: TransferEvent): void {
  let vaultContract = VaultContract.bind(event.address)
  internalMapTransfer(
    event.transaction.hash,
    event.transaction.index,
    event.address,
    event.params.sender,
    event.params.receiver,
    event.params.value,
    vaultContract.totalAssets(),
    vaultContract.totalSupply(),
    event.block.timestamp,
    event.block.number
  );
}