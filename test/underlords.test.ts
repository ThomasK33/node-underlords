/* eslint-disable no-undef */
import {
	BoardCellNum,
	EquippedItem,
	SharecodeMaxTalents,
	ShareCodeV8,
} from "../src/underlords";

/**
 * ShareCodeV8 test
 */
describe("ShareCodeV8 test", () => {
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
		const unitItems: EquippedItem[][] = [];

		for (let i = 0; i < BoardCellNum; i++) {
			unitItems[i] = [];

			for (let j = 0; j < BoardCellNum; j++) {
				unitItems[i][j] = new EquippedItem();
			}
		}

		unitItems[4][4] = new EquippedItem(10211);

		expect(shareCode.unitItems).toEqual(unitItems);
	});

	it("parses board unit ids", () => {
		const boardUnitIDs: number[][] = [];

		for (let i = 0; i < BoardCellNum; i++) {
			boardUnitIDs[i] = [];
			for (let j = 0; j < BoardCellNum; j++) {
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

		for (let i = 0; i < SharecodeMaxTalents; i++) {
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
			new EquippedItem(),
			new EquippedItem(10101),
			new EquippedItem(),
			new EquippedItem(),
			new EquippedItem(10100),
			new EquippedItem(),
			new EquippedItem(),
			new EquippedItem(),
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
			[new EquippedItem(10103), new EquippedItem(10103)],
			[new EquippedItem(0), new EquippedItem(0)],
			[new EquippedItem(0), new EquippedItem(0)],
			[new EquippedItem(0), new EquippedItem(0)],
			[new EquippedItem(0), new EquippedItem(0)],
			[new EquippedItem(0), new EquippedItem(0)],
			[new EquippedItem(0), new EquippedItem(0)],
			[new EquippedItem(0), new EquippedItem(0)],
		]);
	});
});
