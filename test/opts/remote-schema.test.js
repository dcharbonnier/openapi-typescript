import { expect } from "chai";
import fs from "fs";
import eol from "eol";
import openapiTS from "../../dist/esm/index.js";

describe("remote $refs", () => {
  it("resolves remote $refs", async () => {
    const generated = await openapiTS(new URL("./fixtures/remote-schema/spec.yml", import.meta.url));
    const expected = eol.lf(fs.readFileSync(new URL("./expected/remote-schema.ts", import.meta.url), "utf8"));
    expect(generated).to.equal(expected);
  });
});
