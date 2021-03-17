import { Address, ethereum, BigInt, log } from '@graphprotocol/graph-ts';
import { Harvested as HarvestedEvent } from '../../generated/templates/Vault/Strategy';
import * as strategyLibrary from '../utils/strategy';
import { getOrCreateTransactionFromEvent } from '../utils/transaction';

export function handleHarvested(event: HarvestedEvent): void {
  log.debug('[Strategy Mapping] Handle harvested', []);
  getOrCreateTransactionFromEvent(event, 'Harvested');
  strategyLibrary.harvest(
    event.transaction.from,
    event.address,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash,
    event.transaction.index,
    event.params.profit,
    event.params.loss,
    event.params.debtPayment,
    event.params.debtOutstanding
  );
}
