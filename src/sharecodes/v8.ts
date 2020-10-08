// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import { Base64 } from "js-base64";
import * as snappy from "snappyjs";

export const BoardCellNumV8 = 8;
export const SharecodeMaxTalentsV8 = 16;
export const SharecodeMaxUnequippedItemsV8 = 8;

export class EquippedItemV8 {
	constructor(public itemID = 0) {}
}

export class ShareCodeV8 {
	private version = 0; // 8 bits
	public unitItems: EquippedItemV8[][]; // 24 bits per unit item    (192 bytes)
	public boardUnitIDs: number[][]; // 8 bits per unit          (64 bytes)
	public selectedTalents: number[][]; // 128 bits per player      (32 bytes)
	public unitRanks: number[][]; // 4 bits per unit rank     (32 bytes)
	public benchUnitItems: EquippedItemV8[]; // 24 bits per unit item    (24 bytes)
	public benchedUnitIDs: number[]; // 8 bits per unit          (8 bytes)
	public benchUnitRanks: number[]; // 4 bits per unit rank     (4 bytes)
	public underlordIDs: number[]; // 8 bits per player        (2 bytes)
	public underlordRanks: number[]; // 8 bits per player        (2 bytes)
	public unequippedItems: EquippedItemV8[][]; // 24 bits per unused item  (60 bytes)

	public static bitSize = {
		version: 8,
		unitItems: 192 * 8,
		boardUnitIDs: 64 * 8,
		selectedTalents: 32 * 8,
		packedUnitRanks: 32 * 8,
		benchUnitItems: 24 * 8,
		benchedUnitIDs: 8 * 8,
		packedBenchUnitRanks: 4 * 8,
		underlordIDs: 2 * 8,
		underlordRanks: 2 * 8,
		unequippedItems: 60 * 8,
	};

	public static bitOffset = {
		version: 0,
		unitItems: 1 * 8,
		boardUnitIDs: 193 * 8,
		selectedTalents: 257 * 8,
		packedUnitRanks: 292 * 8,
		benchUnitItems: 324 * 8,
		benchedUnitIDs: 348 * 8,
		packedBenchUnitRanks: 356 * 8,
		underlordIDs: 360 * 8,
		underlordRanks: 362 * 8,
		unequippedItems: 364 * 8,
	};

	constructor() {
		// Initialize all fields with default values
		this.unitItems = [];
		for (let i = 0; i < BoardCellNumV8; i++) {
			this.unitItems[i] = [];
			for (let j = 0; j < BoardCellNumV8; j++) {
				this.unitItems[i][j] = new EquippedItemV8();
			}
		}

		this.boardUnitIDs = [];
		for (let i = 0; i < BoardCellNumV8; i++) {
			this.boardUnitIDs[i] = [];
			for (let j = 0; j < BoardCellNumV8; j++) {
				this.boardUnitIDs[i][j] = 0;
			}
		}

		this.selectedTalents = [];
		for (let i = 0; i < SharecodeMaxTalentsV8; i++) {
			this.selectedTalents[i] = [];
			for (let j = 0; j < 2; j++) {
				this.selectedTalents[i][j] = 0;
			}
		}

		this.unitRanks = [];
		for (let i = 0; i < BoardCellNumV8; i++) {
			this.unitRanks[i] = [0, 0, 0, 0, 0, 0, 0, 0];
		}

		this.benchUnitItems = [];
		for (let i = 0; i < BoardCellNumV8; i++) {
			this.benchUnitItems[i] = new EquippedItemV8();
		}

		this.benchedUnitIDs = [];
		for (let i = 0; i < BoardCellNumV8; i++) {
			this.benchedUnitIDs[i] = 0;
		}

		this.benchUnitRanks = [];
		for (let i = 0; i < BoardCellNumV8; i++) {
			this.benchUnitRanks[i] = 0;
		}

		this.underlordIDs = [0, 0];
		this.underlordRanks = [0, 0];

		this.unequippedItems = [];
		for (let i = 0; i < SharecodeMaxUnequippedItemsV8; i++) {
			this.unequippedItems[i] = [];
			for (let j = 0; j < 2; j++) {
				this.unequippedItems[i][j] = new EquippedItemV8();
			}
		}
	}

	/**
	 * Returns the decoded board state from a base64 encoded share code
	 *
	 * @param code - Base64 encoded share code
	 * @returns Parsed share code object
	 */
	public static fromBase64String(code: string) {
		if (code.charAt(0) !== "8") {
			throw new Error("Unsupported share code version");
		}

		// const compressedBytes = base64ToBytesArr(code.substr(1));
		const compressedBytes = Base64.toUint8Array(
			code.substr(1),
		) as Uint8Array;
		const uncompressedBytes = snappy.uncompress(
			compressedBytes,
		) as typeof compressedBytes;
		const bitString = uncompressedBytes.reduce(
			(str, byte) => str + byte.toString(2).padStart(8, "0"),
			"",
		);

		return ShareCodeV8.fromBitString(bitString);
	}

	/**
	 * Returns the decoded board state from an uncompressed bit string representation of the underlords share code
	 *
	 * @param bitString - Bit string
	 * @returns Parsed share code object
	 */
	public static fromBitString(bitString: string) {
		const shareCode = new ShareCodeV8();

		shareCode.parseVersion(bitString);
		shareCode.parseUnitItems(bitString);
		shareCode.parseBoardUnitIDs(bitString);
		shareCode.parseSelectedTalents(bitString);
		shareCode.parsePackedUnitRanks(bitString);
		shareCode.parseBenchUnitItems(bitString);
		shareCode.parseBenchedUnitIDs(bitString);
		shareCode.parsePackedBenchUnitRanks(bitString);
		shareCode.parseUnderlordIDs(bitString);
		shareCode.parseUnderlordRanks(bitString);
		shareCode.parseUnequippedItems(bitString);

		return shareCode;
	}

	/**
	 * Returns the encoded base64 Underlords share code
	 *
	 * @returns Underlords share code
	 */
	public toString() {
		return this.toBase64String();
	}

	/**
	 * Returns the encoded base64 Underlords share code
	 *
	 * @returns Underlords share code
	 */
	public toBase64String() {
		const bitString = this.toBitString();
		/* istanbul ignore next */
		const numberBytesArray =
			bitString.match(/.{1,8}/g)?.reduce<number[]>((acc, byteString) => {
				acc.push(parseInt(byteString, 2));

				return acc;
			}, []) ?? [];
		const uint8Array = new Uint8Array(numberBytesArray);
		const compressedBytes = snappy.compress(
			uint8Array,
		) as typeof uint8Array;

		return "8" + Base64.fromUint8Array(compressedBytes);
	}

	/**
	 * Returns the uncompressed raw bit string for an Underlords share code
	 *
	 * @returns Uncompressed bit string of the Underlords share code
	 */
	public toBitString() {
		const stringSize =
			ShareCodeV8.bitSize.unequippedItems +
			ShareCodeV8.bitOffset.unequippedItems;

		// const bitString = new Array(stringSize + 1).join("0");
		let bitString: string[] = [];
		for (let i = 0; i < stringSize; i++) {
			bitString[i] = "0";
		}

		bitString = this.serializeVersion(bitString);
		bitString = this.serializeUnitItems(bitString);
		bitString = this.serializeBoardUnitIDs(bitString);
		bitString = this.serializeSelectedTalents(bitString);
		bitString = this.serializePackedUnitRanks(bitString);
		bitString = this.serializeBenchUnitItems(bitString);
		bitString = this.serializeBenchedUnitIDs(bitString);
		bitString = this.serializePackedBenchUnitRanks(bitString);
		bitString = this.serializeUnderlordIDs(bitString);
		bitString = this.serializeUnderlordRanks(bitString);
		bitString = this.serializeUnequippedItems(bitString);

		return bitString.join("");
	}

	private serializeVersion(bitString: string[]): string[] {
		/* istanbul ignore next */
		const bitVersion = this.version.toString(2).match(/.{1,1}/g) ?? [];

		for (let i = 0; i < bitVersion.length; i++) {
			bitString[ShareCodeV8.bitOffset.version + i] = bitVersion[i];
		}

		return bitString;
	}

	private serializeUnitItems(bitString: string[]): string[] {
		for (let i = 0; i < this.unitItems.length; i++) {
			const unitItemCell = this.unitItems[i];

			for (let j = 0; j < unitItemCell.length; j++) {
				const unitItem = unitItemCell[j];
				const itemID = unitItem.itemID;

				/* istanbul ignore next */
				const [h, l] =
					itemID
						.toString(2)
						.padStart(16, "0")
						.match(/.{1,8}/g) ?? [];

				const bitSeries = [l, h, "00000000"].join("");

				for (let k = 0; k < bitSeries.length; k++) {
					bitString[
						ShareCodeV8.bitOffset.unitItems +
							i * 8 * 24 +
							j * 24 +
							k
					] = bitSeries.charAt(k);
				}
			}
		}

		return bitString;
	}

	private serializeBoardUnitIDs(bitString: string[]): string[] {
		for (let i = 0; i < BoardCellNumV8; i++) {
			for (let j = 0; j < BoardCellNumV8; j++) {
				const binaryBoardUnitID = this.boardUnitIDs[i][j]
					.toString(2)
					.padStart(8, "0");

				for (let k = 0; k < binaryBoardUnitID.length; k++) {
					bitString[
						ShareCodeV8.bitOffset.boardUnitIDs +
							i * 8 * 8 +
							j * 8 +
							k
					] = binaryBoardUnitID.charAt(k);
				}
			}
		}

		return bitString;
	}

	private serializeSelectedTalents(bitString: string[]): string[] {
		for (let i = 0; i < SharecodeMaxTalentsV8; i++) {
			for (let j = 0; j < 2; j++) {
				const selectedTalent = this.selectedTalents[i][j];
				const binarySelectedTalent = selectedTalent
					.toString(2)
					.padStart(8, "0");

				for (let k = 0; k < binarySelectedTalent.length; k++) {
					bitString[
						ShareCodeV8.bitOffset.selectedTalents +
							i * 2 * 8 +
							j * 8 +
							k
					] = binarySelectedTalent.charAt(k);
				}
			}
		}

		return bitString;
	}

	private serializePackedUnitRanks(bitString: string[]): string[] {
		for (let i = 0; i < BoardCellNumV8; i++) {
			const column = this.unitRanks[i];

			let packedUnitRank = 0;

			for (let j = 0; j < column.length; j++) {
				const rank = column[j];

				const offsets = [1, 2, 4, 8];

				for (
					let offsetIndex = 0;
					offsetIndex < offsets.length;
					offsetIndex++
				) {
					const offset = offsets[offsetIndex];

					const bit = (rank & offset) === offset;

					if (bit) {
						packedUnitRank |= 1 << (j * 4 + offsetIndex);
					}
				}
			}

			// Bit sequence is encoded in UINT32 - Little Endian (DCBA) Array
			// Thus swap the byte order from ABCD -> DCBA
			/* istanbul ignore next */
			const bitPackedUnitRank = (
				packedUnitRank
					.toString(2)
					.padStart(32, "0")
					.match(/.{1,8}/g) ?? []
			)
				.reverse()
				.join("");

			for (let k = 0; k < bitPackedUnitRank.length; k++) {
				bitString[
					ShareCodeV8.bitOffset.packedUnitRanks + i * 32 + k
				] = bitPackedUnitRank.charAt(k);
			}
		}

		return bitString;
	}

	private serializeBenchUnitItems(bitString: string[]): string[] {
		for (let i = 0; i < this.benchUnitItems.length; i++) {
			const itemID = this.benchUnitItems[i].itemID;

			/* istanbul ignore next */
			const [h, l] =
				itemID
					.toString(2)
					.padStart(16, "0")
					.match(/.{1,8}/g) ?? [];

			const bitSeries = [l, h, "00000000"].join("");

			for (let k = 0; k < bitSeries.length; k++) {
				bitString[
					ShareCodeV8.bitOffset.benchUnitItems + i * 24 + k
				] = bitSeries.charAt(k);
			}
		}

		return bitString;
	}

	private serializeBenchedUnitIDs(bitString: string[]): string[] {
		for (let i = 0; i < this.benchedUnitIDs.length; i++) {
			const benchedID = this.benchedUnitIDs[i]
				.toString(2)
				.padStart(8, "0");

			for (let j = 0; j < benchedID.length; j++) {
				bitString[
					ShareCodeV8.bitOffset.benchedUnitIDs + i * 8 + j
				] = benchedID.charAt(j);
			}
		}

		return bitString;
	}

	private serializePackedBenchUnitRanks(bitString: string[]): string[] {
		const column = this.benchUnitRanks;

		let packedUnitRank = 0;

		for (let j = 0; j < column.length; j++) {
			const rank = column[j];

			const offsets = [1, 2, 4, 8];

			for (
				let offsetIndex = 0;
				offsetIndex < offsets.length;
				offsetIndex++
			) {
				const offset = offsets[offsetIndex];

				const bit = (rank & offset) === offset;

				if (bit) {
					packedUnitRank |= 1 << (j * 4 + offsetIndex);
				}
			}
		}

		// Bit sequence is encoded in UINT32 - Little Endian (DCBA) Array
		// Thus swap the byte order from ABCD -> DCBA
		/* istanbul ignore next */
		const bitPackedUnitRank = (
			packedUnitRank
				.toString(2)
				.padStart(32, "0")
				.match(/.{1,8}/g) ?? []
		)
			.reverse()
			.join("");

		for (let k = 0; k < bitPackedUnitRank.length; k++) {
			bitString[
				ShareCodeV8.bitOffset.packedBenchUnitRanks + k
			] = bitPackedUnitRank.charAt(k);
		}

		return bitString;
	}

	private serializeUnderlordIDs(bitString: string[]): string[] {
		for (let i = 0; i < 2; i++) {
			const underlordID = this.underlordIDs[i];
			const binaryUnderlordID = underlordID.toString(2).padStart(8, "0");

			for (let k = 0; k < binaryUnderlordID.length; k++) {
				bitString[
					ShareCodeV8.bitOffset.underlordIDs + i * 8 + k
				] = binaryUnderlordID.charAt(k);
			}
		}

		return bitString;
	}

	private serializeUnderlordRanks(bitString: string[]): string[] {
		for (let i = 0; i < 2; i++) {
			const underlordRank = this.underlordRanks[i];
			const binaryUnderlordRank = underlordRank
				.toString(2)
				.padStart(8, "0");

			for (let k = 0; k < binaryUnderlordRank.length; k++) {
				bitString[
					ShareCodeV8.bitOffset.underlordRanks + i * 8 + k
				] = binaryUnderlordRank.charAt(k);
			}
		}

		return bitString;
	}

	private serializeUnequippedItems(bitString: string[]): string[] {
		for (let i = 0; i < BoardCellNumV8; i++) {
			for (let j = 0; j < 2; j++) {
				const unequippedItemID = this.unequippedItems[i][j].itemID;
				/* istanbul ignore next */
				const [h, l] =
					unequippedItemID
						.toString(2)
						.padStart(16, "0")
						.match(/.{1,8}/g) ?? [];

				const bitSeries = [l, h, "00000000"].join("");

				for (let k = 0; k < bitSeries.length; k++) {
					bitString[
						ShareCodeV8.bitOffset.unequippedItems +
							i * 2 * 24 +
							j * 24 +
							k
					] = bitSeries.charAt(k);
				}
			}
		}

		return bitString;
	}

	private parseVersion(bitString: string) {
		const version = bitString.substr(0, ShareCodeV8.bitSize.version);

		this.version = parseInt(version, 2);
	}

	private parseUnitItems(bitString: string) {
		let unitItems = bitString.substr(
			ShareCodeV8.bitOffset.unitItems,
			ShareCodeV8.bitSize.unitItems,
		);

		for (let i = 0; i < BoardCellNumV8; i++) {
			for (let j = 0; j < BoardCellNumV8; j++) {
				const itemBits = unitItems.substr(0, 24);
				unitItems = unitItems.slice(24);

				const [l, h] = [
					itemBits.substr(0, 8),
					itemBits.substr(8, 8),
					itemBits.substr(16, 8),
				];

				this.unitItems[i][j] = new EquippedItemV8(parseInt(h + l, 2));
			}
		}
	}

	private parseBoardUnitIDs(bitString: string) {
		let boardUnitIDs = bitString.substr(
			ShareCodeV8.bitOffset.boardUnitIDs,
			ShareCodeV8.bitSize.boardUnitIDs,
		);

		for (let i = 0; i < BoardCellNumV8; i++) {
			for (let j = 0; j < BoardCellNumV8; j++) {
				const unitID = boardUnitIDs.substr(0, 8);
				boardUnitIDs = boardUnitIDs.slice(8);

				this.boardUnitIDs[i][j] = parseInt(unitID, 2);
			}
		}
	}

	private parseSelectedTalents(bitString: string) {
		let selectedTalents = bitString.substr(
			ShareCodeV8.bitOffset.selectedTalents,
			ShareCodeV8.bitSize.selectedTalents,
		);

		for (let i = 0; i < SharecodeMaxTalentsV8; i++) {
			for (let j = 0; j < 2; j++) {
				const talent = selectedTalents.substr(0, 8);
				selectedTalents = selectedTalents.slice(8);

				this.selectedTalents[i][j] = parseInt(talent, 2);
			}
		}
	}

	private parsePackedUnitRanks(bitString: string) {
		let sPackedUnitRanks = bitString.substr(
			ShareCodeV8.bitOffset.packedUnitRanks,
			ShareCodeV8.bitSize.packedUnitRanks,
		);

		// UINT32 - Little Endian (DCBA) Array

		// Split the packedUnitRanks into arrays of 32 characters
		// Divide those into array of 8 characters and reverse them
		// --> Thus going from ABCD to DCBA
		// Either parseInt with 2 base and get the packed uint32 values
		// Or directly access the 4 bits and parseInt base 2 them

		/* istanbul ignore next */
		sPackedUnitRanks = (sPackedUnitRanks.match(/.{1,32}/g) ?? [])
			.map((bytes) => {
				/* istanbul ignore next */
				return (bytes.match(/.{1,8}/g) ?? []).reverse().join("");
			})
			.join("");

		/* istanbul ignore next */
		const iPackedUnitRanks = (
			sPackedUnitRanks.match(/.{1,32}/g) ?? []
		).map((i) => parseInt(i, 2));

		const offsets = [0, 1, 2, 4];

		for (let i = 0; i < iPackedUnitRanks.length; i++) {
			const uint32PackedRank = iPackedUnitRanks[i];

			for (let j = 0; j < BoardCellNumV8; j++) {
				for (
					let offsetIndex = 0;
					offsetIndex < offsets.length;
					offsetIndex++
				) {
					const offset = offsets[offsetIndex];

					const value = 1 << (j * 4 + offsetIndex);
					const packedRankAnd = uint32PackedRank & value;

					if (packedRankAnd === value) {
						this.unitRanks[i][j] |= 1 << offset;
					}
				}
			}
		}
	}

	private parseBenchUnitItems(bitString: string) {
		let benchUnitItems = bitString.substr(
			ShareCodeV8.bitOffset.benchUnitItems,
			ShareCodeV8.bitSize.benchUnitItems,
		);

		for (let i = 0; i < BoardCellNumV8; i++) {
			const itemBits = benchUnitItems.substr(0, 24);
			benchUnitItems = benchUnitItems.slice(24);

			const [l, h] = [
				itemBits.substr(0, 8),
				itemBits.substr(8, 8),
				itemBits.substr(16, 8),
			];

			this.benchUnitItems[i] = new EquippedItemV8(parseInt(h + l, 2));
		}
	}

	private parseBenchedUnitIDs(bitString: string) {
		let benchedUnitIDs = bitString.substr(
			ShareCodeV8.bitOffset.benchedUnitIDs,
			ShareCodeV8.bitSize.benchedUnitIDs,
		);

		for (let i = 0; i < BoardCellNumV8; i++) {
			const benchUnitID = benchedUnitIDs.substr(0, 8);
			benchedUnitIDs = benchedUnitIDs.slice(8);

			this.benchedUnitIDs[i] = parseInt(benchUnitID, 2);
		}
	}

	private parsePackedBenchUnitRanks(bitString: string) {
		let packedBenchUnitRanks = bitString.substr(
			ShareCodeV8.bitOffset.packedBenchUnitRanks,
			ShareCodeV8.bitSize.packedBenchUnitRanks,
		);

		// Uint32 little endian, thus ABCD --> DCBA swap
		/* istanbul ignore next */
		packedBenchUnitRanks = (packedBenchUnitRanks.match(/.{1,8}/g) ?? [])
			.reverse()
			.join("");

		const uint32PackedRank = parseInt(packedBenchUnitRanks, 2);

		const offsets = [0, 1, 2, 4];

		for (let j = 0; j < BoardCellNumV8; j++) {
			for (
				let offsetIndex = 0;
				offsetIndex < offsets.length;
				offsetIndex++
			) {
				const offset = offsets[offsetIndex];

				const value = 1 << (j * 4 + offsetIndex);
				const packedRankAnd = uint32PackedRank & value;

				if (packedRankAnd === value) {
					this.benchUnitRanks[j] |= 1 << offset;
				}
			}
		}
	}

	private parseUnderlordIDs(bitString: string) {
		let underlordIDs = bitString.substr(
			ShareCodeV8.bitOffset.underlordIDs,
			ShareCodeV8.bitSize.underlordIDs,
		);

		for (let i = 0; i < 2; i++) {
			const underlordsID = underlordIDs.substr(0, 8);
			underlordIDs = underlordIDs.slice(8);

			this.underlordIDs[i] = parseInt(underlordsID, 2);
		}
	}

	private parseUnderlordRanks(bitString: string) {
		let underlordRanks = bitString.substr(
			ShareCodeV8.bitOffset.underlordRanks,
			ShareCodeV8.bitSize.underlordRanks,
		);

		for (let i = 0; i < 2; i++) {
			const underlordRank = underlordRanks.substr(0, 8);
			underlordRanks = underlordRanks.slice(8);

			this.underlordRanks[i] = parseInt(underlordRank, 2);
		}
	}

	private parseUnequippedItems(bitString: string) {
		let unequippedItems = bitString.substr(
			ShareCodeV8.bitOffset.unequippedItems,
			ShareCodeV8.bitSize.unequippedItems,
		);

		for (let i = 0; i < SharecodeMaxUnequippedItemsV8; i++) {
			for (let j = 0; j < 2; j++) {
				const itemBits = unequippedItems.substr(0, 24);
				unequippedItems = unequippedItems.slice(24);

				const [l, h] = [
					itemBits.substr(0, 8),
					itemBits.substr(8, 8),
					itemBits.substr(16, 8),
				];

				this.unequippedItems[i][j] = new EquippedItemV8(
					parseInt(h + l, 2),
				);
			}
		}
	}
}
