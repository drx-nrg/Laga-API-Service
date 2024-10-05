const convertToDateTime = (date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}T${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}-${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}Z`;


    const dateConverter = (dateString) => {
        const rules = {
          m: 1000 * 60,
          h: 1000 * 60 * 60,
          d: 1000 * 60 * 60 * 24,
        };
      
        const splittedDate = dateString.split("");
        let date = Number(
          splittedDate.filter((_, i) => i !== splittedDate.length - 1).join("")
        );
        let datePostfix = splittedDate[splittedDate.length - 1];
        return date * rules[datePostfix];
      };

const expirationDate = new Date(Date.now() + (1000 * 60 * 60 * 24 * 7)).toDateString();
console.log(expirationDate);
