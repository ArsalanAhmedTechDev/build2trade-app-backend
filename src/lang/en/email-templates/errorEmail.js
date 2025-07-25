let date = new Date();
var today =
    (date.getMonth() + 1).toString() +
    "/" +
    date.getDate().toString() +
    "/" +
    date.getFullYear().toString();
const subject = "Units are not Allocated.";
let year = date.getUTCFullYear();

const body =
    `<div>
        Hi Tech Team,
        <br>
        Date : 29/07/2024
        <br>
        There is some issue in Unit Allocation Inquiry.
        <br>
        Folio Number : FOLIO
        <br>
        Customer Name : NAME
        <br>
        CNIC : IDCARDNUMBER
        <br>
        Investment Amount : INVESTMENT_AMOUNT
        <br>
        Investment Sent to AMC Date : INVESTMENT_DATE
        <br>
        Regards,
        <br>
        Pingup
    </div>`;

module.exports = {
    subject,
    body,
};
