const BASE_URL = 'https://schedule.kantiana.ru';

let lastRequestTime = 0;

export async function getPage() {
  const timeSinceLastRequest = Date.now() - lastRequestTime;

  if (timeSinceLastRequest > 1000) {
    lastRequestTime = Date.now();
    const response = await fetch(BASE_URL);
    return response;
  } else {
    return new Promise<Response>((res) => {
      setTimeout(async () => {
        lastRequestTime = Date.now();
        const response = await fetch(BASE_URL);
        res(response);
      }, timeSinceLastRequest);
    });
  }
}

async function getSchedulePageByDay(date: string, group: string) {
  const URL = `${BASE_URL}/setday`;

  const body = new FormData();
  body.append('group_last', '');
  body.append('group', group);
  body.append('setdate', date);

  const timeSinceLastRequest = Date.now() - lastRequestTime;

  if (timeSinceLastRequest > 1000) {
    lastRequestTime = Date.now();
    const response = await fetch(URL, { body, method: 'POST' });
    return response;
  } else {
    return new Promise<Response>((res) => {
      setTimeout(async () => {
        lastRequestTime = Date.now();
        const response = await fetch(URL, { body, method: 'POST' });
        res(response);
      }, timeSinceLastRequest);
    });
  }
}

async function getSchedulePageByWeek(date: string, group: string) {
  const URL = `${BASE_URL}/week`;

  const body = new FormData();
  body.append('group_last', '');
  body.append('group', group);
  body.append('setdate', date);

  // const body = `group_last=${group}&group=&setdate=${date}`;

  const timeSinceLastRequest = Date.now() - lastRequestTime;

  if (timeSinceLastRequest > 1000) {
    lastRequestTime = Date.now();
    const response = await fetch(URL, { body, method: 'POST' });
    return response;
  } else {
    return new Promise<Response>((res) => {
      setTimeout(async () => {
        lastRequestTime = Date.now();
        const response = await fetch(URL, { body, method: 'POST' });
        res(response);
      }, timeSinceLastRequest);
    });
  }
}

function extractSchedule(
  page: Document,
  date: string,
  isWeek?: boolean
): { [key: string]: IClass[] } {
  const weeks = page.querySelectorAll('.accordion-item');

  if (weeks.length === 0) {
    if (isWeek) {
      const schedule: { [key: string]: IClass[] } = {};
      const currentDate = new Date(Date.parse(date));

      for (let i = 1; i < 8; i++) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate() + i - currentDate.getDay();

        const dateString = `${year}-${month < 10 ? 0 : ''}${month}-${
          day < 10 ? 0 : ''
        }${day}`;

        schedule[dateString] = [];
      }

      return schedule;
    }

    return { [date]: [] };
  }

  const weeksWithClasses: { [key: string]: IClass[] } = {};

  for (const week of weeks) {
    const dayDate = normalizeDate(
      (week.querySelector('.accordion-header')!.children[0] as HTMLElement)
        .innerText
    );
    weeksWithClasses[dayDate] = [];

    const dayCards = week.querySelectorAll('.card-body');

    for (const classCard of dayCards) {
      const classDate = classCard.querySelector('.col-sm-3')!.childNodes;

      const _subjectsRaw = classCard.querySelectorAll('.col-sm-4');
      const subjectsRaw =
        _subjectsRaw.length > 0
          ? [..._subjectsRaw]
          : [classCard.querySelector('.col-sm-9')!];

      const subjects = [];

      for (const subjectRaw of subjectsRaw) {
        const subject = subjectRaw.querySelectorAll('p');

        const typeRaw = subject[0].innerText.match(/^.{3}/)![0];
        let _type;
        switch (typeRaw.toLowerCase()) {
          case 'лек':
            _type = ClassType.Lecture;
            break;
          case 'лаб':
            _type = ClassType.Laboratory;
            break;
          case 'пра':
            _type = ClassType.Practical;
            break;
          default:
            _type = ClassType.Error;
        }

        let place;
        let subgroup;

        if (subject.length > 5) {
          place = (subject[4].children[0] as HTMLAnchorElement).href;

          subgroup = parseInt(subject[5].innerText.match(/\d+/)?.[0] || '-1');
        } else {
          place = subject[3].innerText;

          subgroup = parseInt(subject[4].innerText.match(/\d+/)?.[0] || '-1');
        }

        subjects.push({
          type: _type,
          item: subject[1].innerText,
          teacher: subject[2].innerText,
          place,
          subgroup,
        });
      }

      weeksWithClasses[dayDate].push({
        count: (classDate[1] as HTMLElement).innerText,
        time: (classDate[3] as HTMLElement).innerText,
        subjects,
      });
    }
  }

  const currentDate = new Date(Date.parse(date));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate() + 7 - (currentDate.getDay() === 0 ? 7 : currentDate.getDay() + 1);

  const sundayDate = `${year}-${month < 10 ? 0 : ''}${month}-${
    day < 10 ? 0 : ''
  }${day}`;

  if (isWeek && weeksWithClasses[sundayDate] === undefined) {
    weeksWithClasses[sundayDate] = [];
  }

  return weeksWithClasses;
}

function normalizeDate(inputDate: string): string {
  const [day, month, year] = inputDate.trim().split(' ')[0].split('.');

  return `${year}-${month}-${day}`;
}

enum ClassType {
  Lecture = 'Лекция',
  Practical = 'Практика',
  Laboratory = 'Лаба',
  Error = 'Ошибка!',
}

export interface IClass {
  count: string;
  time: string;
  subjects: {
    [key: number]: ISubject;
  };
}

interface ISubject {
  type: ClassType;
  item: string;
  teacher: string;
  place: string;
  subgroup: number;
}

/**
 * @param {string} date - In format of yyyy-mm-dd
 */
export async function getScheduleForWeek(
  date: string,
  group: string
): Promise<{ [key: string]: IClass[] }> {
  const page = await getSchedulePageByWeek(date, group);

  const t = await page.text();

  const parsedPage = new DOMParser().parseFromString(t, 'text/html');

  return extractSchedule(parsedPage, date, true);
}

/**
 * @param {string} date - In format of yyyy-mm-dd
 */
export async function getScheduleForDay(
  date: string,
  group: string
): Promise<{ [key: string]: IClass[] }> {
  const page = await getSchedulePageByDay(date, group);

  const t = await page.text();

  const parsedPage = new DOMParser().parseFromString(t, 'text/html');

  return extractSchedule(parsedPage, date);
}
