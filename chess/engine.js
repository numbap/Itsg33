// Chess rules: board state, legal move generation, make/undo, check and mate, SAN.
// Squares are 0..63 with a1 = 0, h1 = 7, a8 = 56. Pieces are FEN letters
// (uppercase white, lowercase black); empty squares are null.

export const FILES = "abcdefgh";
export const sqName = (s) => FILES[s & 7] + ((s >> 3) + 1);
export const sqIndex = (n) => (n.charCodeAt(1) - 49) * 8 + (n.charCodeAt(0) - 97);
export const colorOf = (p) => (p === p.toUpperCase() ? "w" : "b");
const other = (c) => (c === "w" ? "b" : "w");

const KNIGHT = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const KING = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const BISHOP = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

// Precomputed jump targets and sliding rays for every square.
const step = (s, [df, dr]) => {
  const f = (s & 7) + df, r = (s >> 3) + dr;
  return f >= 0 && f < 8 && r >= 0 && r < 8 ? r * 8 + f : -1;
};
const jumps = (dirs) => Array.from({ length: 64 }, (_, s) => dirs.map((d) => step(s, d)).filter((t) => t >= 0));
const rays = (dirs) => Array.from({ length: 64 }, (_, s) => dirs.map((d) => {
  const ray = [];
  for (let t = step(s, d); t >= 0; t = step(t, d)) ray.push(t);
  return ray;
}).filter((r) => r.length));
const KNIGHT_TO = jumps(KNIGHT), KING_TO = jumps(KING);
const ROOK_RAYS = rays(ROOK), BISHOP_RAYS = rays(BISHOP);

const CASTLE_RIGHTS_LOST = { 0: "Q", 7: "K", 56: "q", 63: "k", 4: "KQ", 60: "kq" };

export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export class Position {
  constructor(fen = START_FEN) {
    const [placement, turn = "w", castling = "-", ep = "-", half = "0", full = "1"] = fen.trim().split(/\s+/);
    const rows = placement.split("/");
    if (rows.length !== 8) throw new Error(`Bad FEN: ${fen}`);
    this.board = new Array(64).fill(null);
    rows.forEach((row, i) => {
      let f = 0;
      for (const ch of row) {
        if (/\d/.test(ch)) f += Number(ch);
        else this.board[(7 - i) * 8 + f++] = ch;
      }
      if (f !== 8) throw new Error(`Bad FEN row: ${row}`);
    });
    this.turn = turn;
    this.castling = castling === "-" ? "" : castling;
    this.ep = ep === "-" ? -1 : sqIndex(ep);
    this.half = Number(half);
    this.full = Number(full);
    this.kings = { w: this.board.indexOf("K"), b: this.board.indexOf("k") };
    this.history = [];
  }

  fen() {
    const rows = [];
    for (let r = 7; r >= 0; r--) {
      let row = "", empty = 0;
      for (let f = 0; f < 8; f++) {
        const p = this.board[r * 8 + f];
        if (!p) { empty++; continue; }
        if (empty) { row += empty; empty = 0; }
        row += p;
      }
      rows.push(row + (empty || ""));
    }
    return [rows.join("/"), this.turn, this.castling || "-", this.ep < 0 ? "-" : sqName(this.ep), this.half, this.full].join(" ");
  }

  // Is square s attacked by any piece of colour `by`?
  attacked(s, by) {
    const b = this.board;
    const [P, N, B, R, Q, K] = by === "w" ? "PNBRQK" : "pnbrqk";
    const f = s & 7, back = by === "w" ? -8 : 8;
    if (f > 0 && b[s + back - 1] === P) return true;
    if (f < 7 && b[s + back + 1] === P) return true;
    for (const t of KNIGHT_TO[s]) if (b[t] === N) return true;
    for (const t of KING_TO[s]) if (b[t] === K) return true;
    for (const ray of ROOK_RAYS[s]) {
      for (const t of ray) { const p = b[t]; if (p) { if (p === R || p === Q) return true; break; } }
    }
    for (const ray of BISHOP_RAYS[s]) {
      for (const t of ray) { const p = b[t]; if (p) { if (p === B || p === Q) return true; break; } }
    }
    return false;
  }

  inCheck(color = this.turn) {
    return this.kings[color] >= 0 && this.attacked(this.kings[color], other(color));
  }

  pseudoMoves() {
    const b = this.board, us = this.turn, them = other(us), moves = [];
    const add = (from, to, piece, flag = "n", promo = null) =>
      moves.push({ from, to, piece, captured: flag === "e" ? (us === "w" ? "p" : "P") : b[to], promo, flag });
    const enemy = (t) => b[t] && colorOf(b[t]) === them;
    for (let s = 0; s < 64; s++) {
      const p = b[s];
      if (!p || colorOf(p) !== us) continue;
      const type = p.toLowerCase();
      if (type === "p") {
        const dir = us === "w" ? 8 : -8, r = s >> 3, f = s & 7;
        const startRank = us === "w" ? 1 : 6, lastRank = us === "w" ? 6 : 1;
        const pawnTo = (to, flag) => {
          if (r === lastRank) for (const promo of "qrbn") add(s, to, p, flag, us === "w" ? promo.toUpperCase() : promo);
          else add(s, to, p, flag);
        };
        if (!b[s + dir]) {
          pawnTo(s + dir, "n");
          if (r === startRank && !b[s + 2 * dir]) add(s, s + 2 * dir, p, "d");
        }
        for (const df of [-1, 1]) {
          if (f + df < 0 || f + df > 7) continue;
          const t = s + dir + df;
          if (enemy(t)) pawnTo(t, "n");
          else if (t === this.ep) add(s, t, p, "e");
        }
      } else if (type === "n" || type === "k") {
        for (const t of (type === "n" ? KNIGHT_TO : KING_TO)[s]) if (!b[t] || enemy(t)) add(s, t, p);
      } else {
        const sets = type === "r" ? [ROOK_RAYS] : type === "b" ? [BISHOP_RAYS] : [ROOK_RAYS, BISHOP_RAYS];
        for (const set of sets) for (const ray of set[s]) for (const t of ray) {
          if (!b[t]) { add(s, t, p); continue; }
          if (enemy(t)) add(s, t, p);
          break;
        }
      }
    }
    // Castling: king and rook on their home squares, path empty, king not passing through check.
    const home = us === "w" ? 4 : 60, K = us === "w" ? "K" : "k", Rk = us === "w" ? "R" : "r";
    if (b[home] === K && this.castling) {
      const [kRight, qRight] = us === "w" ? ["K", "Q"] : ["k", "q"];
      if (this.castling.includes(kRight) && b[home + 3] === Rk && !b[home + 1] && !b[home + 2] &&
          !this.attacked(home, them) && !this.attacked(home + 1, them) && !this.attacked(home + 2, them)) {
        add(home, home + 2, K, "k");
      }
      if (this.castling.includes(qRight) && b[home - 4] === Rk && !b[home - 1] && !b[home - 2] && !b[home - 3] &&
          !this.attacked(home, them) && !this.attacked(home - 1, them) && !this.attacked(home - 2, them)) {
        add(home, home - 2, K, "q");
      }
    }
    return moves;
  }

  make(m) {
    const b = this.board, us = this.turn;
    this.history.push({ m, castling: this.castling, ep: this.ep, half: this.half, full: this.full });
    b[m.from] = null;
    b[m.to] = m.promo || m.piece;
    if (m.flag === "e") b[m.to + (us === "w" ? -8 : 8)] = null;
    if (m.flag === "k") { b[m.to - 1] = b[m.to + 1]; b[m.to + 1] = null; }
    if (m.flag === "q") { b[m.to + 1] = b[m.to - 2]; b[m.to - 2] = null; }
    if (m.piece === "K" || m.piece === "k") this.kings[us] = m.to;
    if (this.castling) {
      for (const s of [m.from, m.to]) {
        const lost = CASTLE_RIGHTS_LOST[s];
        if (lost) for (const ch of lost) this.castling = this.castling.replace(ch, "");
      }
    }
    this.ep = m.flag === "d" ? (m.from + m.to) / 2 : -1;
    this.half = m.piece.toLowerCase() === "p" || m.captured ? 0 : this.half + 1;
    if (us === "b") this.full++;
    this.turn = other(us);
  }

  undo() {
    const h = this.history.pop();
    if (!h) return null;
    const { m } = h, b = this.board;
    this.turn = other(this.turn);
    const us = this.turn;
    b[m.from] = m.piece;
    b[m.to] = m.flag === "e" ? null : m.captured;
    if (m.flag === "e") b[m.to + (us === "w" ? -8 : 8)] = m.captured;
    if (m.flag === "k") { b[m.to + 1] = b[m.to - 1]; b[m.to - 1] = null; }
    if (m.flag === "q") { b[m.to - 2] = b[m.to + 1]; b[m.to + 1] = null; }
    if (m.piece === "K" || m.piece === "k") this.kings[us] = m.from;
    Object.assign(this, { castling: h.castling, ep: h.ep, half: h.half, full: h.full });
    return m;
  }

  // Does the side that just moved leave its own king safe?
  #legalAfterMake() {
    const mover = other(this.turn);
    return !(this.kings[mover] >= 0 && this.attacked(this.kings[mover], this.turn));
  }

  legalMoves() {
    return this.pseudoMoves().filter((m) => {
      this.make(m);
      const ok = this.#legalAfterMake();
      this.undo();
      return ok;
    });
  }

  hasLegalMove() {
    for (const m of this.pseudoMoves()) {
      this.make(m);
      const ok = this.#legalAfterMake();
      this.undo();
      if (ok) return true;
    }
    return false;
  }

  isCheckmate() { return this.inCheck() && !this.hasLegalMove(); }
  isStalemate() { return !this.inCheck() && !this.hasLegalMove(); }

  // Standard algebraic notation for a legal move, including +/# suffix.
  san(m, legal = this.legalMoves()) {
    let s;
    if (m.flag === "k") s = "O-O";
    else if (m.flag === "q") s = "O-O-O";
    else {
      const type = m.piece.toUpperCase();
      const capture = m.captured ? "x" : "";
      if (type === "P") {
        s = (capture ? FILES[m.from & 7] + "x" : "") + sqName(m.to) + (m.promo ? "=" + m.promo.toUpperCase() : "");
      } else {
        const rivals = legal.filter((o) => o.piece === m.piece && o.to === m.to && o.from !== m.from);
        let dis = "";
        if (rivals.length) {
          if (!rivals.some((o) => (o.from & 7) === (m.from & 7))) dis = FILES[m.from & 7];
          else if (!rivals.some((o) => o.from >> 3 === m.from >> 3)) dis = String((m.from >> 3) + 1);
          else dis = sqName(m.from);
        }
        s = type + dis + capture + sqName(m.to);
      }
    }
    this.make(m);
    if (this.inCheck()) s += this.hasLegalMove() ? "+" : "#";
    this.undo();
    return s;
  }
}

export const sameMove = (a, b) => a.from === b.from && a.to === b.to && (a.promo || null) === (b.promo || null);
