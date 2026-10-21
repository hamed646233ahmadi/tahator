const { Schema, Types, model } = require("mongoose");

const PostSchema = new Schema(
  {
    title: { type: String, required: false },
    userId: { type: Types.ObjectId, required: true },
    amount: { type: Number, required: true, default: 0 },
    listingType: { type: String, enum: ["barter", "employment"], default: "barter", index: true },
    offerAssetType: { type: String, enum: ["vehicle", "property", "gold", "cash", "other"], default: "other" },
    offerAssetDetails: { type: String, default: "" },
    wantedAssetType: { type: String, enum: ["vehicle", "property", "gold", "cash", "other"], default: "other" },
    wantedAssetDetails: { type: String, default: "" },
    cashDifference: { type: Number, min: 0, default: 0 },
    content: { type: String, required: false },
    category: { type: Types.ObjectId, ref: "Category", required: true },
    province: { type: String, required: false },
    city: { type: String, required: false },
    district: { type: String, required: false },
    address: { type: String, required: false },
    coordinate: { type: [Number], required: false }, //51.215485487, 52.687524154
    images: { type: [String], required: false, default: [] },
    options: { type: Object, default: {} },
  },
  {
    timestamps: true,
  }
);
const PostModel = model("post", PostSchema);
module.exports = PostModel;
