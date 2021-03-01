import { ethereum, BigInt, Address  } from "@graphprotocol/graph-ts";
import {
  Strategy,
  StrategyReport,
} from "../../generated/schema";

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
  let entity = new StrategyReport(id)
  entity.strategy = strategyId
  entity.transaction = transactionId
  entity.gain = gain
  entity.loss = loss
  entity.totalGain = totalGain
  entity.totalLoss = totalLoss
  entity.totalDebt = totalDebt
  entity.debtAdded = debtAdded
  entity.debtLimit = debtLimit
  
  entity.blockNumber = event.block.number
  entity.timestamp = getTimestampInMillis(event.block)
  entity.save()
  return entity
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
    let strategyReport = createStrategyReport(
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
    let reports = strategy.reports
    reports.push(strategyReport.id)
    strategy.reports = reports
    strategy.save()
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
  let id = strategy.toHexString()
  let entity = new Strategy(id)
  entity.transaction = transactionId
  entity.address = strategy
  entity.vault = vault.toHexString()
  entity.reports = []
  // NOTE: derived
  // entity.harvests = []
  entity.debtLimit = debtLimit
  entity.rateLimit = rateLimit
  entity.performanceFeeBps = performanceFee.toI32();
  entity.blockNumber = event.block.number
  entity.timestamp = getTimestampInMillis(event.block)
  entity.save()
  return entity
}