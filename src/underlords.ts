// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import { Base64 } from "js-base64";
import * as snappy from "snappyjs";

export const BoardCellNum = 8;
export const SharecodeMaxTalents = 16;
export const SharecodeMaxUnequippedItems = 8;

export class EquippedItem {
	constructor(public itemID = 0) {}
}

export class ShareCodeV8 {
	private version = 0; // 8 bits
	public unitItems: EquippedItem[][]; // 24 bits per unit item    (192 bytes)
	public boardUnitIDs: number[][]; // 8 bits per unit          (64 bytes)
	public selectedTalents: number[][]; // 128 bits per player      (32 bytes)
	public unitRanks: number[][]; // 4 bits per unit rank     (32 bytes)
	public benchUnitItems: EquippedItem[]; // 24 bits per unit item    (24 bytes)
	public benchedUnitIDs: number[]; // 8 bits per unit          (8 bytes)
	public benchUnitRanks: number[]; // 4 bits per unit rank     (4 bytes)
	public underlordIDs: number[]; // 8 bits per player        (2 bytes)
	public underlordRanks: number[]; // 8 bits per player        (2 bytes)
	public unequippedItems: EquippedItem[][]; // 24 bits per unused item  (60 bytes)

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
		for (let i = 0; i < BoardCellNum; i++) {
			this.unitItems[i] = [];
			for (let j = 0; j < BoardCellNum; j++) {
				this.unitItems[i][j] = new EquippedItem();
			}
		}

		this.boardUnitIDs = [];
		for (let i = 0; i < BoardCellNum; i++) {
			this.boardUnitIDs[i] = [];
			for (let j = 0; j < BoardCellNum; j++) {
				this.boardUnitIDs[i][j] = 0;
			}
		}

		this.selectedTalents = [];
		for (let i = 0; i < SharecodeMaxTalents; i++) {
			this.selectedTalents[i] = [];
			for (let j = 0; j < 2; j++) {
				this.selectedTalents[i][j] = 0;
			}
		}

		this.unitRanks = [];
		for (let i = 0; i < BoardCellNum; i++) {
			this.unitRanks[i] = [0, 0, 0, 0, 0, 0, 0, 0];
		}

		this.benchUnitItems = [];
		for (let i = 0; i < BoardCellNum; i++) {
			this.benchUnitItems[i] = new EquippedItem();
		}

		this.benchedUnitIDs = [];
		for (let i = 0; i < BoardCellNum; i++) {
			this.benchedUnitIDs[i] = 0;
		}

		this.benchUnitRanks = [];
		for (let i = 0; i < BoardCellNum; i++) {
			this.benchUnitRanks[i] = 0;
		}

		this.underlordIDs = [0, 0];
		this.underlordRanks = [0, 0];

		this.unequippedItems = [];
		for (let i = 0; i < SharecodeMaxUnequippedItems; i++) {
			this.unequippedItems[i] = [];
			for (let j = 0; j < 2; j++) {
				this.unequippedItems[i][j] = new EquippedItem();
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
		if (code.charAt(0) != "8") {
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

	private parseVersion(bitString: string) {
		const version = bitString.substr(0, ShareCodeV8.bitSize.version);

		this.version = parseInt(version, 2);
	}

	private parseUnitItems(bitString: string) {
		let unitItems = bitString.substr(
			ShareCodeV8.bitOffset.unitItems,
			ShareCodeV8.bitSize.unitItems,
		);

		for (let i = 0; i < BoardCellNum; i++) {
			for (let j = 0; j < BoardCellNum; j++) {
				let itemBits = unitItems.substr(0, 24);
				unitItems = unitItems.slice(24);

				const [l, h, unused] = [
					itemBits.substr(0, 8),
					itemBits.substr(8, 8),
					itemBits.substr(16, 8),
				];

				this.unitItems[i][j] = new EquippedItem(parseInt(h + l, 2));
			}
		}
	}

	private parseBoardUnitIDs(bitString: string) {
		let boardUnitIDs = bitString.substr(
			ShareCodeV8.bitOffset.boardUnitIDs,
			ShareCodeV8.bitSize.boardUnitIDs,
		);

		for (let i = 0; i < BoardCellNum; i++) {
			for (let j = 0; j < BoardCellNum; j++) {
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

		for (let i = 0; i < SharecodeMaxTalents; i++) {
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

			for (let j = 0; j < BoardCellNum; j++) {
				for (
					let offsetIndex = 0;
					offsetIndex < offsets.length;
					offsetIndex++
				) {
					const offset = offsets[offsetIndex];

					const value = 1 << (j * 4 + offsetIndex);
					const packedRankAnd = uint32PackedRank & value;

					if (packedRankAnd == value) {
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

		for (let i = 0; i < BoardCellNum; i++) {
			let itemBits = benchUnitItems.substr(0, 24);
			benchUnitItems = benchUnitItems.slice(24);

			const [l, h, unused] = [
				itemBits.substr(0, 8),
				itemBits.substr(8, 8),
				itemBits.substr(16, 8),
			];

			this.benchUnitItems[i] = new EquippedItem(parseInt(h + l, 2));
		}
	}

	private parseBenchedUnitIDs(bitString: string) {
		let benchedUnitIDs = bitString.substr(
			ShareCodeV8.bitOffset.benchedUnitIDs,
			ShareCodeV8.bitSize.benchedUnitIDs,
		);

		for (let i = 0; i < BoardCellNum; i++) {
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

		for (let j = 0; j < BoardCellNum; j++) {
			for (
				let offsetIndex = 0;
				offsetIndex < offsets.length;
				offsetIndex++
			) {
				const offset = offsets[offsetIndex];

				const value = 1 << (j * 4 + offsetIndex);
				const packedRankAnd = uint32PackedRank & value;

				if (packedRankAnd == value) {
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

		for (let i = 0; i < SharecodeMaxUnequippedItems; i++) {
			for (let j = 0; j < 2; j++) {
				let itemBits = unequippedItems.substr(0, 24);
				unequippedItems = unequippedItems.slice(24);

				const [l, h, unused] = [
					itemBits.substr(0, 8),
					itemBits.substr(8, 8),
					itemBits.substr(16, 8),
				];

				this.unequippedItems[i][j] = new EquippedItem(
					parseInt(h + l, 2),
				);
			}
		}
	}
}
