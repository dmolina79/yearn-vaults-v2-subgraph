import { log, ethereum, BigInt, Address  } from "@graphprotocol/graph-ts";
import {
  Strategy,
  StrategyReport,
} from "../../generated/schema";

import {
  Strategy as StrategyContract
} from "../../generated/templates/Vault/Strategy";

import { buildIdFromEvent, getTimestampInMillis } from "./commons";

export function createStrategyReport(
  transactionId: string,
  strategyId: string,
  gain: BigInt,
  loss: BigInt,
  totalGain: BigInt,
  totalLoss: BigInt,
  totalDebt: BigInt,
  debtAdded: BigInt,
  debtLimit: BigInt,
  event: ethereum.Event
): StrategyReport {
  let id = buildIdFromEvent(event)
  let strategy = new StrategyReport(id)
  strategy.strategy = strategyId
  strategy.blockNumber = event.block.number
  strategy.timestamp = getTimestampInMillis(event.block)
  strategy.transaction = transactionId
  strategy.gain = gain
  strategy.loss = loss
  strategy.totalGain = totalGain
  strategy.totalLoss = totalLoss
  strategy.totalDebt = totalDebt
  strategy.debtAdded = debtAdded
  strategy.debtLimit = debtLimit
  strategy.save()
  return strategy
}

export function reportStrategy(
  transactionId: string,
  strategyId: string,
  gain: BigInt,
  loss: BigInt,
  totalGain: BigInt,
  totalLoss: BigInt,
  totalDebt: BigInt,
  debtAdded: BigInt,
  debtLimit: BigInt,
  event: ethereum.Event
):void {
  let strategy = Strategy.load(strategyId)
  if (strategy !== null) {
    createStrategyReport(
      transactionId,
      strategyId,
      gain,
      loss,
      totalGain,
      totalLoss,
      totalDebt,
      debtAdded,
      debtLimit,
      event
    )
  }
}

export function createStrategy(
  transactionId: string,
  strategy: Address,
  vault: Address,
  debtLimit: BigInt,
  rateLimit: BigInt,
  performanceFee: BigInt,
  event: ethereum.Event
): Strategy {
  let strategyContract = StrategyContract.bind(strategy);
  let tryName = strategyContract.try_name();

  let id = strategy.toHexString()
  let entity = new Strategy(id)
  entity.blockNumber = event.block.number
  entity.timestamp = getTimestampInMillis(event.block)
  entity.transaction = transactionId
  entity.name = tryName.reverted ? "TBD" : tryName.value.toString();
  entity.address = strategy
  entity.vault = vault.toHexString()
  entity.debtLimit = debtLimit
  entity.rateLimit = rateLimit
  entity.performanceFeeBps = performanceFee.toI32();
  entity.save()
  return entity
}