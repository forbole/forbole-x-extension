"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encoding_1 = require("@cosmjs/encoding");
const secp256k1signature_1 = require("./secp256k1signature");
describe("Secp256k1Signature", () => {
    describe("fromFixedLength", () => {
        it("works", () => {
            const data = encoding_1.fromHex("000000000000000000000000000000000000000000000000000000000000223300000000000000000000000000000000000000000000000000000000000000aa");
            const signature = secp256k1signature_1.Secp256k1Signature.fromFixedLength(data);
            expect(signature.r()).toEqual(new Uint8Array([0x22, 0x33]));
            expect(signature.s()).toEqual(new Uint8Array([0xaa]));
        });
        it("throws for invalid length", () => {
            const data = encoding_1.fromHex("000000000000000000000000000000000000000000000000000000000000223300000000000000000000000000000000000000000000000000000000000000aa01");
            expect(() => secp256k1signature_1.Secp256k1Signature.fromFixedLength(data)).toThrowError(/got invalid data length/i);
        });
    });
    it("can be constructed", () => {
        const signature = new secp256k1signature_1.Secp256k1Signature(new Uint8Array([0x22, 0x33]), new Uint8Array([0xaa]));
        expect(signature).toBeTruthy();
    });
    it("can get r and s", () => {
        const signature = new secp256k1signature_1.Secp256k1Signature(new Uint8Array([0x22, 0x33]), new Uint8Array([0xaa]));
        expect(signature.r()).toEqual(new Uint8Array([0x22, 0x33]));
        expect(signature.s()).toEqual(new Uint8Array([0xaa]));
    });
    it("can padd r and s", () => {
        const signature = new secp256k1signature_1.Secp256k1Signature(new Uint8Array([0x22, 0x33]), new Uint8Array([0xaa]));
        expect(signature.r(2)).toEqual(encoding_1.fromHex("2233"));
        expect(signature.r(5)).toEqual(encoding_1.fromHex("0000002233"));
        expect(signature.r(32)).toEqual(encoding_1.fromHex("0000000000000000000000000000000000000000000000000000000000002233"));
        expect(signature.s(1)).toEqual(encoding_1.fromHex("AA"));
        expect(signature.s(2)).toEqual(encoding_1.fromHex("00AA"));
        expect(signature.s(7)).toEqual(encoding_1.fromHex("000000000000AA"));
    });
    it("throws when output size of r or s is too small", () => {
        const signature = new secp256k1signature_1.Secp256k1Signature(new Uint8Array([0x22, 0x33, 0x44]), new Uint8Array([0xaa, 0xbb]));
        expect(() => signature.r(0)).toThrowError(/length too small to hold parameter r/i);
        expect(() => signature.r(1)).toThrowError(/length too small to hold parameter r/i);
        expect(() => signature.r(2)).toThrowError(/length too small to hold parameter r/i);
        expect(() => signature.s(0)).toThrowError(/length too small to hold parameter s/i);
        expect(() => signature.s(1)).toThrowError(/length too small to hold parameter s/i);
    });
    it("throws for r with leading 0", () => {
        expect(() => new secp256k1signature_1.Secp256k1Signature(encoding_1.fromHex("00F25B86E1D8A11D72475B3ED273B0781C7D7F6F9E1DAE0DD5D3EE9B84F3FAB891"), new Uint8Array([0xaa]))).toThrowError(/unsigned integer r must be encoded as unpadded big endian./i);
    });
    it("throws for s with leading 0", () => {
        expect(() => new secp256k1signature_1.Secp256k1Signature(new Uint8Array([0xaa]), encoding_1.fromHex("00F25B86E1D8A11D72475B3ED273B0781C7D7F6F9E1DAE0DD5D3EE9B84F3FAB891"))).toThrowError(/unsigned integer s must be encoded as unpadded big endian./i);
    });
    it("can be encoded as fixed length", () => {
        const signature = new secp256k1signature_1.Secp256k1Signature(new Uint8Array([0x22, 0x33]), new Uint8Array([0xaa]));
        expect(signature.toFixedLength()).toEqual(encoding_1.fromHex("000000000000000000000000000000000000000000000000000000000000223300000000000000000000000000000000000000000000000000000000000000aa"));
    });
    it("can encode to DER", () => {
        // Signature 3045022100f25b86e1d8a11d72475b3ed273b0781c7d7f6f9e1dae0dd5d3ee9b84f3fab891022063d9c4e1391de077244583e9a6e3d8e8e1f236a3bf5963735353b93b1a3ba935
        // decoded by http://asn1-playground.oss.com/
        const signature = new secp256k1signature_1.Secp256k1Signature(encoding_1.fromHex("F25B86E1D8A11D72475B3ED273B0781C7D7F6F9E1DAE0DD5D3EE9B84F3FAB891"), encoding_1.fromHex("63D9C4E1391DE077244583E9A6E3D8E8E1F236A3BF5963735353B93B1A3BA935"));
        expect(signature.toDer()).toEqual(encoding_1.fromHex("3045022100f25b86e1d8a11d72475b3ed273b0781c7d7f6f9e1dae0dd5d3ee9b84f3fab891022063d9c4e1391de077244583e9a6e3d8e8e1f236a3bf5963735353b93b1a3ba935"));
    });
    it("can decode from DER", () => {
        // Signature 3045022100f25b86e1d8a11d72475b3ed273b0781c7d7f6f9e1dae0dd5d3ee9b84f3fab891022063d9c4e1391de077244583e9a6e3d8e8e1f236a3bf5963735353b93b1a3ba935
        // decoded by http://asn1-playground.oss.com/
        const signature = secp256k1signature_1.Secp256k1Signature.fromDer(encoding_1.fromHex("3045022100f25b86e1d8a11d72475b3ed273b0781c7d7f6f9e1dae0dd5d3ee9b84f3fab891022063d9c4e1391de077244583e9a6e3d8e8e1f236a3bf5963735353b93b1a3ba935"));
        expect(signature.toDer()).toEqual(encoding_1.fromHex("3045022100f25b86e1d8a11d72475b3ed273b0781c7d7f6f9e1dae0dd5d3ee9b84f3fab891022063d9c4e1391de077244583e9a6e3d8e8e1f236a3bf5963735353b93b1a3ba935"));
        expect(signature.r()).toEqual(encoding_1.fromHex("F25B86E1D8A11D72475B3ED273B0781C7D7F6F9E1DAE0DD5D3EE9B84F3FAB891"));
        expect(signature.s()).toEqual(encoding_1.fromHex("63D9C4E1391DE077244583E9A6E3D8E8E1F236A3BF5963735353B93B1A3BA935"));
    });
});
describe("ExtendedSecp256k1Signature", () => {
    it("can be constructed", () => {
        const signature = new secp256k1signature_1.ExtendedSecp256k1Signature(new Uint8Array([0x22, 0x33]), new Uint8Array([0xaa]), 1);
        expect(signature.recovery).toEqual(1);
    });
    it("throws for recovery param out of range", () => {
        expect(() => new secp256k1signature_1.ExtendedSecp256k1Signature(encoding_1.fromHex("aa"), encoding_1.fromHex("bb"), Number.NaN)).toThrowError(/the recovery parameter must be an integer/i);
        expect(() => new secp256k1signature_1.ExtendedSecp256k1Signature(encoding_1.fromHex("aa"), encoding_1.fromHex("bb"), Number.NEGATIVE_INFINITY)).toThrowError(/the recovery parameter must be an integer/i);
        expect(() => new secp256k1signature_1.ExtendedSecp256k1Signature(encoding_1.fromHex("aa"), encoding_1.fromHex("bb"), Number.POSITIVE_INFINITY)).toThrowError(/the recovery parameter must be an integer/i);
        expect(() => new secp256k1signature_1.ExtendedSecp256k1Signature(encoding_1.fromHex("aa"), encoding_1.fromHex("bb"), 1.1)).toThrowError(/the recovery parameter must be an integer/i);
        expect(() => new secp256k1signature_1.ExtendedSecp256k1Signature(encoding_1.fromHex("aa"), encoding_1.fromHex("bb"), -1)).toThrowError(/the recovery parameter must be one of 0, 1, 2, 3/i);
        expect(() => new secp256k1signature_1.ExtendedSecp256k1Signature(encoding_1.fromHex("aa"), encoding_1.fromHex("bb"), 5)).toThrowError(/the recovery parameter must be one of 0, 1, 2, 3/i);
    });
    it("can be encoded as fixed length", () => {
        const signature = new secp256k1signature_1.ExtendedSecp256k1Signature(new Uint8Array([0x22, 0x33]), new Uint8Array([0xaa]), 1);
        expect(signature.toFixedLength()).toEqual(encoding_1.fromHex("000000000000000000000000000000000000000000000000000000000000223300000000000000000000000000000000000000000000000000000000000000aa01"));
    });
    it("can be decoded from fixed length", () => {
        const signature = secp256k1signature_1.ExtendedSecp256k1Signature.fromFixedLength(encoding_1.fromHex("000000000000000000000000000000000000000000000000000000000000223300000000000000000000000000000000000000000000000000000000000000aa01"));
        expect(signature.r()).toEqual(new Uint8Array([0x22, 0x33]));
        expect(signature.s()).toEqual(new Uint8Array([0xaa]));
        expect(signature.recovery).toEqual(1);
    });
});
//# sourceMappingURL=secp256k1signature.spec.js.map