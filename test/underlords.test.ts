/* eslint-disable no-undef */
import {
	BoardCellNumV8,
	EquippedItemV8,
	SharecodeMaxUnequippedItemsV8,
	SharecodeMaxTalentsV8,
	ShareCodeV8,
} from "../src/sharecodes/v8";

import {
	BoardCellNumV8 as IndexBoardCellNumV8,
	EquippedItemV8 as IndexEquippedItemV8,
	ShareCodeV8 as IndexShareCodeV8,
	SharecodeMaxTalentsV8 as IndexSharecodeMaxTalentsV8,
	SharecodeMaxUnequippedItemsV8 as IndexSharecodeMaxUnequippedItemsV8,
} from "../src/underlords";

/**
 * ShareCodeV8 decoding
 */
describe("ShareCodeV8 decoding", () => {
	let shareCode = new ShareCodeV8();

	beforeAll(() => {
		const shareCodeB64 =
			"8qAMAAP4BAK4BAATjJ/5uAEZuAAAgEVM0LgAAAG0AbQAACwAAAP8BDAABCRsI/wAJARcBAQAOAQUBAQAGES0QbUBHOlcBEmoBAAFIACABaBABAyAAEAEpLAIgIAAwAAAGAgEgAAWCAHUR2gB0EQkBAQRjAAVyLBAAAgABBAMGdycAdy4fAK4BAA==";

		shareCode = ShareCodeV8.fromBase64String(shareCodeB64);
	});

	it("throws an error for a unsupported share code version", () => {
		expect(() =>
			ShareCodeV8.fromBase64String("7unnecessaryContent"),
		).toThrowError();
		expect(() =>
			ShareCodeV8.fromBase64String("dummyContent"),
		).toThrowError();
	});

	it("decodes the share code to an object", () => {
		expect(shareCode).toBeInstanceOf(Object);
	});

	it("parses unit items", () => {
		const unitItems: EquippedItemV8[][] = [];

		for (let i = 0; i < BoardCellNumV8; i++) {
			unitItems[i] = [];

			for (let j = 0; j < BoardCellNumV8; j++) {
				unitItems[i][j] = new EquippedItemV8();
			}
		}

		unitItems[4][4] = new EquippedItemV8(10211);

		expect(shareCode.unitItems).toEqual(unitItems);
	});

	it("parses board unit ids", () => {
		const boardUnitIDs: number[][] = [];

		for (let i = 0; i < BoardCellNumV8; i++) {
			boardUnitIDs[i] = [];
			for (let j = 0; j < BoardCellNumV8; j++) {
				boardUnitIDs[i][j] = 0;
			}
		}

		boardUnitIDs[0][0] = 32;

		boardUnitIDs[1][1] = 46;
		boardUnitIDs[1][5] = 109;
		boardUnitIDs[1][7] = 109;

		boardUnitIDs[2][2] = 11;
		boardUnitIDs[2][6] = 255;

		boardUnitIDs[3][1] = 109;
		boardUnitIDs[3][3] = 1;

		boardUnitIDs[4][2] = 255;
		boardUnitIDs[4][4] = 9;
		boardUnitIDs[4][6] = 109;

		boardUnitIDs[5][5] = 14;

		boardUnitIDs[6][6] = 6;

		boardUnitIDs[7][2] = 109;
		boardUnitIDs[7][4] = 109;
		boardUnitIDs[7][7] = 109;

		expect(shareCode.boardUnitIDs).toEqual(boardUnitIDs);
	});

	it("parses selected underlords talents", () => {
		const selectedTalents: number[][] = [];

		for (let i = 0; i < SharecodeMaxTalentsV8; i++) {
			selectedTalents[i] = [];
			for (let j = 0; j < 2; j++) {
				selectedTalents[i][j] = 0;
			}
		}

		selectedTalents[0][0] = 64;
		selectedTalents[0][1] = 71;

		selectedTalents[1][0] = 58;
		selectedTalents[1][1] = 87;

		expect(shareCode.selectedTalents).toEqual(selectedTalents);
	});

	it("parses unit ranks", () => {
		expect(shareCode.unitRanks).toEqual([
			[1, 0, 0, 0, 0, 0, 0, 0],
			[0, 2, 0, 2, 0, 0, 0, 0],
			[0, 0, 1, 0, 3, 0, 0, 2],
			[0, 0, 0, 1, 0, 0, 0, 0],
			[0, 0, 0, 0, 2, 0, 0, 2],
			[0, 2, 0, 0, 0, 3, 0, 0],
			[0, 0, 6, 0, 2, 0, 1, 0],
			[0, 2, 0, 0, 0, 0, 0, 2],
		]);
	});

	it("parses the items of benched units", () => {
		expect(shareCode.benchUnitItems).toEqual([
			new EquippedItemV8(),
			new EquippedItemV8(10101),
			new EquippedItemV8(),
			new EquippedItemV8(),
			new EquippedItemV8(10100),
			new EquippedItemV8(),
			new EquippedItemV8(),
			new EquippedItemV8(),
		]);
	});

	it("parses the benched unit ids", () => {
		expect(shareCode.benchedUnitIDs).toEqual([0, 99, 0, 0, 14, 0, 0, 0]);
	});

	it("parses packed bench unit ranks", () => {
		expect(shareCode.benchUnitRanks).toEqual([0, 1, 0, 0, 2, 0, 0, 0]);
	});

	it("parses Underlords ids", () => {
		expect(shareCode.underlordIDs).toEqual([1, 4]);
	});

	it("parses Underlords ranks", () => {
		expect(shareCode.underlordRanks).toEqual([3, 6]);
	});

	it("parses unequipped items", () => {
		expect(shareCode.unequippedItems).toEqual([
			[new EquippedItemV8(10103), new EquippedItemV8(10103)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
		]);
	});
});

/**
 * ShareCodeV8 encoding
 */
describe("ShareCodeV8 encoding", () => {
	let shareCode = new ShareCodeV8();

	beforeEach(() => {
		shareCode = new ShareCodeV8();
	});

	it("encodes the share code to a string", () => {
		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAP4BAP4BAP4BAJoBAA==",
		);
	});

	it("encodes unit items", () => {
		shareCode.unitItems[4][4] = new EquippedItemV8(10211);

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAK4BAATjJ/5uAK5uAP4BAP4BAP4BADIBAA==",
		);
	});

	it("encodes board unit ids", () => {
		shareCode.boardUnitIDs[0][0] = 32;

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAAAg/sEA/sEA/sEAlgEA",
		);
	});

	it("encodes selected underlords talents", () => {
		shareCode.selectedTalents[0][0] = 64;
		shareCode.selectedTalents[0][1] = 71;

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAP4BAARAR/4CAf4CAZICAQ==",
		);
	});

	it("encodes unit ranks", () => {
		shareCode.unitRanks = [
			[1, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0, 0, 0, 0],
			[0, 1, 0, 0, 0, 0, 0, 0],
		];

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAP4BAIoBAAABaiQBABBqHAD+AQAuAQA=",
		);
	});

	it("encodes the items of benched units", () => {
		shareCode.benchUnitItems = [
			new EquippedItemV8(),
			new EquippedItemV8(10101),
			new EquippedItemV8(),
			new EquippedItemV8(),
			new EquippedItemV8(10100),
			new EquippedItemV8(),
			new EquippedItemV8(),
			new EquippedItemV8(),
		];

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAP4BAP4BAAkBBHUnLUgAdBEJ/gEAOgEA",
		);
	});

	it("encodes the benched unit ids", () => {
		shareCode.benchedUnitIDs = [0, 99, 0, 0, 14, 0, 0, 0];

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAP4BAP4BAG4BAAxjAAAO/mABLWA=",
		);
	});

	it("encodes packed bench unit ranks", () => {
		shareCode.benchUnitRanks = [0, 1, 0, 0, 2, 0, 0, 0];

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAP4BAP4BAIoBAAgQAALuZgElZg==",
		);
	});

	it("encodes Underlords ids", () => {
		shareCode.underlordIDs = [1, 4];

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAP4BAP4BAJoBAAQBBPZpAQ==",
		);
	});

	it("encodes Underlords ranks", () => {
		shareCode.underlordRanks = [3, 6];

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAP4BAP4BAKIBAAQDBu5rAQ==",
		);
	});

	it("encodes unequipped items", () => {
		shareCode.unequippedItems = [
			[new EquippedItemV8(10103), new EquippedItemV8(10103)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
			[new EquippedItemV8(0), new EquippedItemV8(0)],
		];

		expect(shareCode.toString()).toEqual(
			"8qAMAAP4BAP4BAP4BAP4BAP4BAKoBAAR3JwED1gEA",
		);
	});
});

/*
 * ShareCodeV8 general tests
 */
describe("ShareCodeV8 general tests", () => {
	it("should parse and serialize to the same code", () => {
		const initialShareCode =
			"8qAMAAP4BAK4BAATjJ/5uAEZuAAAgEVM0LgAAAG0AbQAACwAAAP8BDAABCRsI/wAJARcBAQAOAQUBAQAGES0QbUBHOlcBEmoBAAFIACABaBABAyAAEAEpLAIgIAAwAAAGAgEgAAWCAHUR2gB0EQkBAQRjAAVyLBAAAgABBAMGdycAdy4fAK4BAA==";

		const shareCode = ShareCodeV8.fromBase64String(initialShareCode);

		expect(shareCode.toString()).toEqual(initialShareCode);
		expect(shareCode.toBase64String()).toEqual(initialShareCode);
	});
});

/*
 * Main export structure
 */
describe("Main project file", () => {
	it("should export V8 related classes and variables", () => {
		expect(IndexBoardCellNumV8).toEqual(BoardCellNumV8);
		expect(IndexEquippedItemV8).toEqual(EquippedItemV8);
		expect(IndexShareCodeV8).toEqual(ShareCodeV8);
		expect(IndexSharecodeMaxTalentsV8).toEqual(SharecodeMaxTalentsV8);
		expect(IndexSharecodeMaxUnequippedItemsV8).toEqual(
			SharecodeMaxUnequippedItemsV8,
		);
	});
});
