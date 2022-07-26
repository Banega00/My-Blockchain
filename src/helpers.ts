import { BinaryToTextEncoding, createHash } from 'crypto';
import { ec } from 'elliptic';
import { CommunicationType } from './communication/Communication';
import { PubSubType } from './communication/PubSub';

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

export const elliptic = new ec('secp256k1');

export const verifySignature = ({ publicKey, data, signature }) => {
  const keyFromPublic = elliptic.keyFromPublic(publicKey, 'hex');

  return keyFromPublic.verify(calculateHash(concatAndStringify(data)), signature);
};

export function binaryToHex(s) {
  let i, k, part, accum, ret = '';
  for (i = s.length-1; i >= 3; i -= 4) {
      // extract out in substrings of 4 and convert to hex
      part = s.substr(i+1-4, 4);
      accum = 0;
      for (k = 0; k < 4; k += 1) {
          if (part[k] !== '0' && part[k] !== '1') {
              // invalid character
              return { valid: false };
          }
          // compute the length 4 substring
          accum = accum * 2 + parseInt(part[k], 10);
      }
      if (accum >= 10) {
          // 'A' to 'F'
          ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
      } else {
          // '0' to '9'
          ret = String(accum) + ret;
      }
  }
  // remaining characters, i = 0, 1, or 2
  if (i >= 0) {
      accum = 0;
      // convert from front
      for (k = 0; k <= i; k += 1) {
          if (s[k] !== '0' && s[k] !== '1') {
              return { valid: false };
          }
          accum = accum * 2 + parseInt(s[k], 10);
      }
      // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
      ret = String(accum) + ret;
  }
  return { valid: true, result: ret };
}

class EnvWrapper {
	public port = +this.getProperty("BACKEND_PORT") || 3000;
    public root_node_url = this.getProperty('ROOT_NODE_URL') || 'http://localhost:3000'
	public env_type = this.getProperty("env_type") || 'dev';


	public p2p_port = +this.getProperty("p2p_port") || 9000;
 
	public root_node_p2p_address = this.getProperty("p2p_root").split(':')[0] || 'http://localhost';
	public root_node_p2p_port = +this.getProperty("p2p_root").split(':')[1] || 9000;
    
	public is_root_node = (this.getProperty("IS_ROOT_NODE") == 'true') || false;
	public communication_type = this.getProperty("communication_type") || 'P2P'; 

    public redis = {
        url: this.getProperty("redis_url")
    }
    
    public pubnub = {
        publishKey: this.getProperty("pubnub_publish_key"),
        subscribeKey: this.getProperty("pubnub_subscribe_key"),
        secretKey: this.getProperty("pubnub_secret_key")
    }

    public pubSubType = this.getProperty("pub_sub_type");
    public wallet_data = this.getProperty("wallet_data") || 'blockchain-data';
    private getProperty(property: string): string {
        return process.env[property.toUpperCase()] || process.env[property.toLowerCase()] || "";
    }
}

export const env = new EnvWrapper();
console.log(env)