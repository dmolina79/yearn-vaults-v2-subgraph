import { BigInt } from "@graphprotocol/graph-ts";
import {
  NewRelease as NewReleaseEvent,
  NewVault as NewVaultEvent,
  NewExperimentalVault as NewExperimentalVaultEvent,
  VaultTagged as VaultTaggedEvent,
} from "../../generated/Registry/Registry";
import { getOrCreateTransactionFromEvent } from "../utils/transaction";
import { releaseVault, createVault, tagVault } from "../utils/vault";

export function handleNewRelease(event: NewReleaseEvent): void {
  releaseVault(
    event.params.template,
    event.params.api_version,
    event.params.release_id,
    event
  )
}

export function handleNewVault(event: NewVaultEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, "NewVaultEvent");
  createVault(
    ethTransaction.id,
    event.params.vault,
    "Endorsed",
    event.params.api_version,
    event.params.deployment_id,
    true,
    event,
  )
}

export function handleNewExperimentalVault(event: NewExperimentalVaultEvent): void {
  let ethTransaction = getOrCreateTransactionFromEvent(event, "NewExperimentalVault");
  createVault(
    ethTransaction.id,
    event.params.vault,
    "Experimental",
    event.params.api_version,
    BigInt.fromI32(-1),
    true,
    event,
  )
}

export function handleVaultTagged(event: VaultTaggedEvent): void {
  tagVault(
    event.params.vault,
    event.params.tag
  )
}