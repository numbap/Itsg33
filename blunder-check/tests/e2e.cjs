// Browser test for Blunder Check.
// Run from the blunder-check folder:  python3 -m http.server 8766  then  node tests/e2e.cjs
const { chromium } = require('playwright');
const URL = process.env.BC_URL || 'http://localhost:8766/blunder-check.html';
const OUT = process.env.BC_SHOTS || __dirname;
let failures = 0;
const check = (ok, label) => { console.log((ok ? 'PASS ' : 'FAIL ') + label); if (!ok) failures++; };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => /ready|Simple/.test(document.getElementById('engineState').textContent), null, { timeout: 30000 });

  // 1. Notation parser
  const cases = await page.evaluate(() => {
    const { readMove, Chess } = window.__blunderCheck;
    const r = (fen, s) => { const out = readMove(s, fen ? new Chess(fen) : new Chess()); return out.move ? 'OK:' + out.move.san : 'ERR:' + out.error.replace(/<[^>]+>/g, ''); };
    const twoKnights = 'r1bqkbnr/pppppppp/2n5/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 2'; // Nb1 and Nf3 can't both reach d2: d2 occupied. Use another
    const ambig = '4k3/8/8/8/8/8/8/N3K2N w - - 0 1'; // knights a1, h1: no shared square. Use rooks:
    const rooks = '4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1';
    const twoRooks = '4k3/8/8/8/8/4K3/8/R6R w - - 0 1';
    const promo = '8/4P3/8/8/8/8/k7/4K3 w - - 0 1';
    const capture = 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2';
    return {
      e4: r(null, 'e4'), Nf3: r(null, 'Nf3'), nf3: r(null, 'nf3'), e2e4: r(null, 'e2e4'), Ne4: r(null, 'Ne4'), junk: r(null, 'hello'),
      castleNo: r(null, 'O-O'), castleZero: r(rooks, '0-0'), castleQ: r(rooks, 'O-O-O'),
      rookAmbig: r(twoRooks, 'Rd1'), rookA: r(twoRooks, 'Rad1'), promoNo: r(promo, 'e8'), promoN: r(promo, 'e8=N'), promoQ: r(promo, 'e8Q'),
      exd5: r(capture, 'exd5'), ed5: r(capture, 'ed5'), d5only: r(capture, 'd5'), check: r(null, 'Nf3+'),
    };
  });
  console.log(cases);
  check(cases.e4 === 'OK:e4', 'pawn move e4');
  check(cases.Nf3 === 'OK:Nf3' && cases.check === 'OK:Nf3', 'Nf3, with or without +');
  check(cases.nf3.includes('capitals'), 'lowercase piece letter explained');
  check(cases.e2e4.includes('coordinate') && cases.e2e4.includes('e4'), 'coordinate notation explained');
  check(cases.Ne4.startsWith('ERR:No knight'), 'illegal knight move explained');
  check(cases.junk.includes('couldn'), 'unreadable input explained');
  check(cases.castleNo.includes('castle kingside'), 'illegal castling explained');
  check(cases.castleZero === 'OK:O-O' && cases.castleQ === 'OK:O-O-O', 'castling with 0-0 and O-O-O');
  check(cases.rookAmbig.includes('More than one rook') && cases.rookA === 'OK:Rad1', 'ambiguous rook move');
  check(cases.promoNo.includes('becomes') && cases.promoN === 'OK:e8=N' && cases.promoQ === 'OK:e8=Q', 'promotion needs a piece');
  check(cases.exd5 === 'OK:exd5' && cases.ed5 === 'OK:exd5', 'pawn capture with or without x');
  check(cases.d5only.includes('file'), 'pawn capture without file explained');

  // 2. Typing a move and the error message
  const isMyTurn = () => page.waitForFunction(() => { const s = document.getElementById('status').textContent; return !/thinking|preparing/.test(s); }, null, { timeout: 30000 });
  await isMyTurn();
  await page.fill('#moveInput', 'Ke5');
  await page.press('#moveInput', 'Enter');
  check((await page.textContent('#moveMsg')).includes('No king'), 'bad typed move shows an error and is not played');
  await page.fill('#moveInput', '');
  await page.click('#keys button:has-text("N")');
  await page.type('#moveInput', 'f3');
  await page.click('#playBtn');
  check((await page.textContent('#moves')).includes('Nf3'), 'typed move with the N key is played');

  // 3. Play on: answer checks with the empty button (often wrong, which feeds the review).
  const plan = ['e3', 'd4', 'Bd3', 'O-O', 'c3', 'Nbd2', 'b3', 'Bb2', 'a4', 'h3', 'g4', 'Kg2', 'Qe2', 'Rh1', 'Rad1', 'c4', 'e4', 'd5', 'Nc4', 'a5'];
  let quizzes = 0, typed = 0, lockedDuringQuiz = false;
  for (let step = 0; step < 120 && typed < 14; step++) {
    await isMyTurn();
    if (await page.isVisible('#newGameBtn')) break;
    if (await page.isVisible('#quizCard')) {
      if (!quizzes) { await page.screenshot({ path: OUT + '/shot-quiz.png' }); lockedDuringQuiz = await page.isDisabled('#moveInput'); }
      quizzes++;
      for (let q = 0; q < 6 && await page.isVisible('#quizCard'); q++) {
        for (let t = 0; t < 2; t++) {
          if (/Next|Start/.test(await page.textContent('#qButtons button.primary'))) break;
          const c = await page.$('#qChoices button:not([disabled])');
          if (c) { await c.click(); await page.click('#qButtons button.primary'); }
          else { const b = await page.$$('#qButtons button'); await b[1].click(); }
        }
        await page.click('#qButtons button.primary');
      }
      continue;
    }
    if (!typed) check(!(await page.isDisabled('#moveInput')), 'input enabled on your turn');
    // Try planned moves first, then any legal move written in SAN.
    let done = false;
    for (const mv of plan) {
      await page.fill('#moveInput', mv); await page.press('#moveInput', 'Enter');
      if ((await page.getAttribute('#moveMsg', 'class')).includes('good')) { done = true; plan.splice(plan.indexOf(mv), 1); break; }
    }
    if (!done) break; // planned moves ran out; resign below
    typed++;
    await page.waitForTimeout(100);
  }
  check(quizzes > 0, `position checks appeared (${quizzes})`);
  check(lockedDuringQuiz, 'move input locked while a check is open');

  // 4. End the game and look at the review.
  if (!(await page.isVisible('#newGameBtn'))) { await isMyTurn(); await page.click('#resignBtn'); }
  await page.waitForSelector('#reviewCard:not([hidden])');
  console.log('review:', (await page.textContent('#reviewSum')).trim());
  const items = await page.$$('#reviewList .review-item');
  console.log('review items:', items.length);
  for (const it of items.slice(0, 6)) console.log('  -', (await it.textContent()).trim());
  check(items.length > 0, 'review lists missed checks or blunders');
  if (items.length) {
    await items[0].click();
    await page.waitForTimeout(300);
    check(await page.isVisible('#reviewDetail'), 'review item opens detail');
    check(await page.$eval('#board', b => b.classList.contains('viewing')), 'board shows the reviewed position');
    const blunder = await page.$('#reviewList .review-item:has(.pill.blunder), #reviewList .review-item:has(.pill.mistake)');
    if (blunder) { await blunder.click(); await page.waitForFunction(() => !document.getElementById('reviewDetail').textContent.includes('Finding'), null, { timeout: 15000 }); console.log('  blunder detail:', (await page.textContent('#reviewDetail')).trim()); }
    await page.screenshot({ path: OUT + '/shot-review.png' });
    await page.click('#reviewBack');
    check(!(await page.$eval('#board', b => b.classList.contains('viewing'))), 'back returns to final position');
  }
  await page.setViewportSize({ width: 400, height: 900 });
  await page.screenshot({ path: OUT + '/shot-phone.png', fullPage: true });
  check(errors.length === 0, 'no console errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  console.log(failures ? `${failures} failed` : 'all passed');
  process.exit(failures ? 1 : 0);
})();
