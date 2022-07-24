import { BinaryToTextEncoding, createHash } from 'crypto';
import { ec } from 'elliptic';

type AllowedHashAlgorithms = 'sha256' | 'sha512' | 'md5' | 'sha1';

export const concatAndStringify = (...inputs:any[]) =>{
    return inputs.map(input => JSON.stringify(input)).sort().join(' ');
}

export const calculateHash = (data:string, options?:{algorithm: AllowedHashAlgorithms, digest: BinaryToTextEncoding}) =>{
    return createHash(options?.algorithm ?? 'sha256')
    .update(data)
    .digest('hex')
    .toString()
}

export const ecliptic = new ec('secp256k1');

export const verifySignature = ({ publicKey, data, signature }) => {
  const keyFromPublic = ecliptic.keyFromPublic(publicKey, 'hex');

  return keyFromPublic.verify(calculateHash(data), signature);
};