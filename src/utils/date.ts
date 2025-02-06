/**
 * @param {number} month - Number of month in range 1-11
 * @returns {string} - In russian
 */
export function monthNumberToString(month: number): string {
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  return months[month];
}

/**
 * @param {number} day - Number of day in range 0-6, where 0 is sunday
 * @returns - In russian
 */
export function dayNumberToString(day: number): string {
  const days = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ];

  return days[day];
}

/**
 * @param {number=} datetime - Unix timestamp
 * @returns {string} In yyyy-mm-dd format
 */
export function getDate(datetime?: Date): string {
  const date = datetime || new Date();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month < 10 ? 0 : ''}${month}-${day < 10 ? 0 : ''}${day}`;
}

/**
 * Checks if passed date is in the current week
 *
 * @param {Date} date - Data to check
 * @returns {boolean}
 */
export function isDateInCurrentWeek(date: Date): boolean {
  const today = new Date();
  const todayDayOfWeek = today.getDay();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(
    today.getDate() - todayDayOfWeek + (todayDayOfWeek === 0 ? -6 : 1)
  );
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 (Вс) - 6 (Сб)
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * If we pass January 2025, the output will be
 *
 * ```
 *        Mon Jan 05 2026
 *  ---------------------------
 *  -29 -30 -31   1   2   3   4
 *    5   6   7   8   9  10  11
 *   12  13  14  15  16  17  18
 *   19  20  21  22  23  24  25
 *   26  27  28  29  30  31  -1
 * ```
 *
 * @param {Date} date - The previous and next months will be extracted from this parameter
 * @returns {number[][]} 2d matrix, where negative numbers do not includes to this month
 */
export function getMonthAsMatrix(date: Date): number[][] {
  // Корректируем день недели: 0 = Понедельник, 6 = Воскресенье
  const startDayOfWeek = (getFirstDayOfMonth(date) + 6) % 7;
  const daysInMonth = getDaysInMonth(date);

  const prevDate = new Date(date);
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthDaysAmount = getDaysInMonth(prevDate);

  // 6x7 matrix
  const matrix = Array.from({ length: 6 }, () => Array(7).fill(0));

  // Fill previous month days
  let day = prevMonthDaysAmount - startDayOfWeek + 1;
  for (let i = 0; i < startDayOfWeek; i++) {
    matrix[0][i] = -day++;
  }

  let lastRow = 0;
  let lastRowNeedToBeFilled = false;

  // Fill current montsh days
  let currentDay = 1;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < startDayOfWeek) continue;
      if (currentDay > daysInMonth) break;

      lastRowNeedToBeFilled = col === 6 ? false : true;
      lastRow = row;
      matrix[row][col] = currentDay++;
    }
  }

  if (lastRow < matrix.length - 1) delete matrix[matrix.length - 1];

  if (!lastRowNeedToBeFilled) {
    return matrix;
  }

  let nextDay = 1;
  const nextMonthOffset = (daysInMonth - (7 - startDayOfWeek)) % 7;
  for (let col = nextMonthOffset; col < 7; col++) {
    matrix[lastRow][col] = -nextDay++;
  }

  return matrix;
}
