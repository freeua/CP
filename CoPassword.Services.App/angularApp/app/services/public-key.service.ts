import { Injectable } from '@angular/core';
import { PkiServiceClient, PublicKeyDataDto } from '@copassword/copassword.clients.pki';

@Injectable()
export class PublicKeyService {

    constructor(
      private readonly _pkiServiceClient: PkiServiceClient
    ) { }

    public getPublicKeyByThumbprint(thumbprint: string): string {

        // not implemented

        return undefined;
    }

    public async getPublicKeyForUser(userId: string): Promise<PublicKeyDataDto> {
        return await this._pkiServiceClient.getPrimaryKeyByUser(userId).toPromise();
    }
}

