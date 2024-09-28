interface Rules {
  [key: string]: number;
}

export const dateConverter = (dateString: string): number => {
  const rules: Rules = {
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
  };

  const splittedDate: string[] = dateString.split("");
  let date: number = Number(
    splittedDate.filter((_, i) => i !== splittedDate.length - 1).join("")
  );
  let datePostfix: string = splittedDate[splittedDate.length - 1];
  return date * rules[datePostfix];
};
