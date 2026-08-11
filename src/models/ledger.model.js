import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "Ledger must be associated with an account"],
    index: true,
    immutable: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required for creating a ledger"],
    immutable: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required: [true, "Ledger must be associated with a transaction"],
    index: true,
    immutable: true,
  },
  type: {
    type: String,
    enum: {
      values: ["CREDIT", "DEBIT"],
    },
    required: [true, "Ledger type is required"],
    immutable: true,
  },
});

function preventLedgerModification(next) {
  throw new Error("Ledger entries cannot be modified once created.");
}

ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);
export default ledgerModel;
