import { BigInt } from '@graphprotocol/graph-ts';
import {
  NewRelease as NewReleaseEvent,
  NewVault as NewVaultEvent,
  NewExperimentalVault as NewExperimentalVaultEvent,
  VaultTagged as VaultTaggedEvent,
} from '../../generated/Registry/Registry';
import { getOrCreateTransactionFromEvent } from '../utils/transaction';
import * as vaultLibrary from '../utils/vault/vault';

export function handleNewRelease(event: NewReleaseEvent): void {
  vaultLibrary.release(
    event.params.template,
    event.params.api_version,
    event.params.release_id,
    event
  );
}

export function handleNewVault(event: NewVaultEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'NewVaultEvent');
  vaultLibrary.create(
    ethTransaction.id,
    event.params.vault,
    'Endorsed',
    event.params.api_version,
    event.params.deployment_id,
    true,
    event
  );
}

export function handleNewExperimentalVault(
  event: NewExperimentalVaultEvent
): void {
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'NewExperimentalVault'
  );
  vaultLibrary.create(
    ethTransaction.id,
    event.params.vault,
    'Experimental',
    event.params.api_version,
    BigInt.fromI32(-1),
    true,
    event
  );
}

export function handleVaultTagged(event: VaultTaggedEvent): void {
  vaultLibrary.tag(event.params.vault, event.params.tag);
}
