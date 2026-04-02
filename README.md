# APOS - API Protocol Overhead Simulator

High-fidelity infrastructure capacity planner and performance simulator for API protocols.

## 🚀 How to Run

1. **Install Bun**: [bun.sh](https://bun.sh/)
2. **Install Dependencies**:
   ```bash
   cd next
   bun install
   ```
3. **Start Development Server**:
   ```bash
   bun dev
   ```
4. **Open Application**: Navigate to [http://localhost:3000](http://localhost:3000)

## 🤝 How to Contribute

1. **Code Standards**: Always run `bun run fix` to ensure consistent formatting and linting.
2. **Type Checking**: Verify changes with `bun typecheck`.
3. **Logic Updates**: Core simulation models reside in `next/lib/calc.ts`. Ensure any changes maintain model fidelity across different architecture tiers.
4. **Localization**: Update `next/lib/i18n.ts` when adding UI text to support English, Spanish, and Russian.

## ⚠️ Disclaimer

This tool provides **theoretical estimations** based on mathematical models. 
- **Accuracy**: ±15–20% for typical workloads (1KB–10KB payload, up to 100k RPS).
- **Use Case**: Designed for initial capacity planning and architecture trade-off comparisons.
- **Limitations**: Does not model database latency, disk I/O, horizontal scaling, or specific runtime warmups. Do not use as a substitute for production load testing.

## 📄 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.
