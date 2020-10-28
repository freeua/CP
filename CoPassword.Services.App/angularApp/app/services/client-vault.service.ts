import { Injectable } from '@angular/core';
import { AES, WordArray } from 'crypto-js';
import { KeyData } from '../entities/keyData';
import { EditableVault } from '../entities/editableVault';
import { DecryptVaultRequestPayload } from '../entities/decryptVaultRequestPayload';
import { EncryptVaultRequestPayload } from '../entities/encryptVaultRequestPayload';
import { DecryptVaultResponsePayload } from '../entities/decryptVaultResponsePayload';
import { EncryptVaultResponsePayload } from '../entities/encryptVaultResponsePayload';
import {
  VaultDto, VaultKeyDto, UserDto, TaskRequestDto, VaultKeyDtoType, TaskResponseDto, SecretManagementServiceClient,
  VaultPermissionDto, SwaggerException, VaultLevelPermissionDto, VaultLevelDto, VaultLevelPermissionSetDto,
  VaultPermissionSetDto
} from '@copassword/copassword.clients.secretmanagement';

import { PublicKeyService } from '../services/public-key.service';
import { SecureStorageService } from './secure-storage.service';
import { UserService } from '../services/user.service';
import { UUID } from 'angular2-uuid';

@Injectable()
export class ClientVaultService {
  private decryptTimer = true;
  private decryptCount = 0;
  public timeout;

  constructor (private readonly _secretManagementServiceClient: SecretManagementServiceClient,
               private readonly _publicKeyService: PublicKeyService,
               private readonly _secureStorageService: SecureStorageService,
               private readonly _userService: UserService) {
  }

  processTaskQueue () {
    let run = true;
    let maxIdleLoops = 5;
    let currentLoop = 0;

    while (run) {

    }
  }
  
  public async createVaultKey (id: string, keydata: KeyData): Promise<VaultKeyDto> {

    let pubKeyData = await this._publicKeyService.getPublicKeyForUser(id);

    let vaultKey = new VaultKeyDto();
    vaultKey.userId = id;
    vaultKey.type = VaultKeyDtoType.AES;
    vaultKey.thumbprint = pubKeyData.publicKeyThumbprint;

    await this.setKeyDataOnVaultKey(keydata, vaultKey, pubKeyData.publicKey);

    return vaultKey;
  }

  public async updateVaultKey (keyData: KeyData, vaultKey: VaultKeyDto): Promise<VaultKeyDto> {

    let publicKey = await this._publicKeyService.getPublicKeyByThumbprint(vaultKey.thumbprint);
    await this.setKeyDataOnVaultKey(keyData, vaultKey, publicKey);

    return vaultKey;
  }

  private async setKeyDataOnVaultKey (keyData: KeyData, vaultKey: VaultKeyDto, publicKey: string): Promise<void> {

    let encryptedSymmetricKey = await this._secureStorageService.encryptByteArray(publicKey, keyData.key.buffer);
    vaultKey.encryptedValue = encryptedSymmetricKey;
    vaultKey.iv = this._secureStorageService.arrayBufferToBase64String(keyData.iv.buffer);
  }

  public async encrypt (editableVault: EditableVault): Promise<VaultDto> {

    this.timeout = true;
    let request = new TaskRequestDto();
    let user = (await this._userService.getUserAccount());
    request.recipientUserId = user.id;
    request.creatorId = user.id;
    request.payloadType = 'EncryptVaultRequest';

    let requestPayload = new EncryptVaultRequestPayload();

    let pkData = await this._publicKeyService.getPublicKeyForUser(user.id);

    if (pkData == undefined) {
      throw new Error('Public key not found');
    }

    let keyData = await this._secureStorageService.createNewSymmetryKey();
    requestPayload.symmetricKeyCypher = await this._secureStorageService.encryptByteArray(pkData.publicKey, keyData.key.buffer);
    requestPayload.symmetricKeyIv = this._secureStorageService.arrayBufferToBase64String(keyData.iv.buffer);
    requestPayload.publicKeyThumbprint = pkData.publicKeyThumbprint;
    requestPayload.decryptedVaultCypher = await this._secureStorageService.encryptSymmetric(JSON.stringify(editableVault.toJS()), keyData);

    request.payload = JSON.stringify(requestPayload.toJS());

    const postEnqueueRequest = await this._secretManagementServiceClient.enqueueRequest(request).toPromise();

    let encryptedVault: VaultDto = null;
    let maxRetryCount = 60;
    let retryCount = 0;
    while (encryptedVault == null) {

      if (retryCount++ >= maxRetryCount) {
        if (this.timeout) {
          this.timeout = false;
        }
        throw new Error('Did not receive any response for request id: ' + postEnqueueRequest.id);
      }

      let response = await this._secretManagementServiceClient.dequeueResponse(postEnqueueRequest.id).toPromise();
      if (response != null && response.requestId == postEnqueueRequest.id && response.payloadType == 'EncryptVaultResponse') {

        if (response.error != null) {
          alert(response.error);
          break;
        }

        let responsePayload: EncryptVaultResponsePayload = EncryptVaultResponsePayload.fromJS(JSON.parse(response.payload));
        encryptedVault = responsePayload.encryptedVault;
        await this._secretManagementServiceClient.confirmDequeueResponse(response.id);
      }

      await new Promise((resolve, reject) => {
        if (this.timeout) {
          setTimeout(function () {
            //a promise that is resolved after 'delay' milliseconds with the data provided
            resolve();
          }, 1000);
        }
      });
    }

    return encryptedVault;
  }

  public async decrypt (vault: VaultDto): Promise<EditableVault> {
    this.timeout = true;
    let request = new TaskRequestDto();
    let user = (await this._userService.getUserAccount());
    request.recipientUserId = user.id;
    request.creatorId = user.id;
    request.payloadType = 'DecryptVaultRequest';

    // create key pair
    let keyPairAlias = UUID.UUID();
    await this._secureStorageService.generateKeyPair(keyPairAlias);
    let publicKey = await this._secureStorageService.exportPublicKey(keyPairAlias);

    let requestPayload = new DecryptVaultRequestPayload();
    requestPayload.publicKey = publicKey;
    requestPayload.vault = vault;

    let payload = JSON.stringify(requestPayload.toJS());
    // console.log('Parsed  request payload: ' + payload);
    request.payload = payload;

    const postEnqueueRequest = await this._secretManagementServiceClient.enqueueRequest(request).toPromise();

    let editableVault: EditableVault = null;
    let maxRetryCount = 60;
    let retryCount = 0;

    while (editableVault == null) {
      if (retryCount++ >= maxRetryCount) {
        if (this.timeout) {
          this.timeout = false;
        }
        throw new Error('Did not receive any response for request id: ' + postEnqueueRequest.id);
      }

      let response = await this._secretManagementServiceClient.dequeueResponse(postEnqueueRequest.id).toPromise();
      if (response != null && response.requestId == postEnqueueRequest.id && response.payloadType == 'DecryptVaultResponse') {

        if (response.error != null) {
          alert(response.error);
          break;
        }

        const responsePayload: DecryptVaultResponsePayload = DecryptVaultResponsePayload.fromJS(JSON.parse(response.payload));

        const keyData = new KeyData();
        keyData.key = new Uint8Array(await this._secureStorageService.decryptByteArray(keyPairAlias, responsePayload.symmetricKeyCypher));
        keyData.iv = this._secureStorageService.base64StringToBinaryArray(responsePayload.symmetricKeyIv);

        const decryptedVaultString = await this._secureStorageService.decryptSymmetric(responsePayload.decryptedVaultCypher, keyData);
        editableVault = EditableVault.fromJS(JSON.parse(decryptedVaultString));
        await this._secretManagementServiceClient.confirmDequeueResponse(response.id);
        break;
      }

      await new Promise((resolve, reject) => {
        if (this.timeout) {
          setTimeout(function () {
            //a promise that is resolved after 'delay' milliseconds with the data provided
            resolve();
          }, 1000);
        }
      });
    }

    await this._secureStorageService.deleteKeyPair(keyPairAlias);
    return editableVault;
  }

  public stopWaiting () {
    this.timeout = false;
  }

  public async getVaults (): Promise<EditableVault[]> {
    let vaults = await this._secretManagementServiceClient.getVaults().toPromise();
    let editableVaults = Array<EditableVault>();

    vaults.forEach(v => {
      editableVaults.push(new EditableVault(v));
    });

    return editableVaults;
  }

  public async createVault (editableVault: EditableVault): Promise<EditableVault> {
    let vault = await this.encrypt(editableVault);

    let updatedVault = await this._secretManagementServiceClient.createVault(vault).toPromise();

    return new EditableVault(updatedVault);
  }

  public async updateVault (id: string, editableVault: EditableVault): Promise<EditableVault> {

    let vault = editableVault.encryptedVault;
    if (editableVault.decrypted) {
      vault = await this.encrypt(editableVault);
    }

    let updatedVault = await this._secretManagementServiceClient.updateVault(id, vault).toPromise();

    return new EditableVault(updatedVault);
  }

  public async deleteVault (editableVault: EditableVault): Promise<void> {
    await this._secretManagementServiceClient.deleteVault(editableVault.id).toPromise();
  }

  public async getVaultPermissionByVault (id: string): Promise<VaultPermissionSetDto> {
    return await this._secretManagementServiceClient.getVaultPermissionByVault(id).toPromise()
  }

  public async createVaultPermission (value: VaultPermissionDto): Promise<VaultPermissionDto> {
    return await this._secretManagementServiceClient.createVaultPermission(value).toPromise()
  }

  public async updateVaultPermission (id: string, value: VaultPermissionDto): Promise<VaultPermissionDto> {
    const result = await this._secretManagementServiceClient.updateVaultPermission(String(id), value).toPromise();
    return new VaultPermissionDto(result);
  }

  public async deleteVaultPermission (id: string): Promise<VaultLevelDto> {
    return await this._secretManagementServiceClient.deleteVaultPermission(id).toPromise();
  }

  public async getVaultLevelPermissionByVaultLevel (id: string): Promise<VaultLevelPermissionSetDto> {
    return await this._secretManagementServiceClient.getVaultLevelPermissionByVaultLevel(id).toPromise()
  }

  public async createVaultLevelPermission (value: VaultLevelPermissionDto): Promise<VaultLevelPermissionDto> {
    return await this._secretManagementServiceClient.createVaultLevelPermission(value).toPromise()
  }

  public async updateVaultLevelPermission (id: string, value: VaultLevelPermissionDto): Promise<VaultLevelPermissionDto> {
    return await this._secretManagementServiceClient.updateVaultLevelPermission(id, value).toPromise()
  }

  public async deleteVaultLevelPermission (id: number): Promise<VaultLevelPermissionDto> {
    return await this._secretManagementServiceClient.deleteVaulLeveltPermission(String(id)).toPromise();
  }

  public async getVaultLevels (subscriptionId: string, userId: string): Promise<VaultLevelDto> {
    return await this._secretManagementServiceClient.getVaultLevelTree(subscriptionId, userId).toPromise();
  }

  public async getVaultLevel (id: number): Promise<VaultLevelDto> {
    return await this._secretManagementServiceClient.getVaultLevel(String(id)).toPromise();
  }

  public async addVaultLevel (vaultLevel: VaultLevelDto): Promise<VaultLevelDto> {
    return this._secretManagementServiceClient.createVaultLevel(vaultLevel).toPromise();
  }

  public async updateVaultLevel (id: number, vaultLevel: VaultLevelDto): Promise<VaultLevelDto> {
    return this._secretManagementServiceClient.updateVaultLevel(String(id), vaultLevel).toPromise();
  }

  public async deleteVaultLevel (id: number): Promise<VaultLevelDto> {
    return await this._secretManagementServiceClient.deleteVaultLevel(String(id)).toPromise();
  }

  public async getLevelVaultPermissionByVaultLevel (id: string): Promise<VaultPermissionSetDto> {
    return await this._secretManagementServiceClient.getLevelVaultPermissionByVaultLevel(id).toPromise();
  }
}
