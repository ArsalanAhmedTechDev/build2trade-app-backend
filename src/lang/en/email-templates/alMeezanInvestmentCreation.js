const subject = "Investment Creation";
let date = new Date();
let year = date.getUTCFullYear();
const body =
  `<div style="margin:0;padding:0;">
    <center>
            <table class="email_table" width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%;min-width: 100%!important;font-family: 'Open Sans','Helvetica Neue',Helvetica,Arial,sans-serif;">
                <tbody>
                    <tr>
                        <td class="email_body email_start email_end" style="padding-bottom:0px; padding-top:0px;text-align: center;line-height: 100%;padding-left: 16px;padding-right: 16px;">
                            <div class="email_container" style="max-width: 600px!important;margin: 0 auto;text-align: center;display: inline-block;width: 100%;vertical-align: top;border-radius:0px;overflow: hidden;background-color:#fff;font-size: 17px;line-height: 24px;color:#1A3743;">
                                <table class="content_section" width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tbody>
                               
                          
                            <tr>
                                <td class="content_cell light_b py" 
                                style="padding:36px; background-color: #f2f2f2;border-radius: 40px;">
                                    <div class="email_row tl">
                                        <div class="col_6">
                                            <table class="column" width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tbody>
                                        <tr> 
<!--                                            <td> -->
<!--                                                <img class="logo-img" -->
<!--                                                    src="LOGO_URL" -->
<!--                                                    style="width: 170px; margin: 0 auto; max-width: 100%;font-family: 'SanFranciscoText-Light', 'SanFranciscoText-Regular' , 'SanFranciscoText-Semibold' , Helvetica, Arial, sans-serif; font-size: 22px; display:block;height:auto;" -->
<!--                                                    align="center">-->
<!--                                            </td>             -->
                                               </tr>
                                                    <tr>
                                                        <td class="column_cell px pte tc" style="vertical-align: top;">
                                                                <table style="width:500px;">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td>
                                                                                <h2 style="font-size: 16px;
                                                                                font-weight: bold; color: #111111; 
                                                                                font-family: Verdana; margin: 0;
                                                                                padding: 0;
                                                                                text-align: left;
                                                                                padding-top: 23px;">
                                                                                    <span style="font-weight:normal">Hi Al Meezan Team,</span>
                                                                                </h2>
                                                                                <p style="color: #111111;width: 500px;line-height: 25px; text-align: left;">
                                                                                <p>We wanted to notify you of a new investment via the Ping Up app. Here are some investment details:</p>
                                                                                <p>Cus ID: <span>CUS_ID</span></p>
                                                                                <p>Name: <span>NAME</span></p>
                                                                                <p>CNIC: <span>CNIC_</span></p>
                                                                                <p>Date of Investment: <span>DATE_OF_INVESTMENT</span></p>
                                                                                <p>Amount: <span>INVESTMENT_AMOUNT</span></p>
                                                                                <p>Fund: <span>FUND</span></p>
                                                                                <p>Please do run this investment; we have sent it through our APIs on the backend.</p>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>

                                                        <tr>    
                                                            <td style="color:#111111;text-align: left;margin-top:10px;padding-top:10px">
                                                                <p>Thank You,</p>
                                                                <p>The Ping Up Team</p>
                                                                <p><strong>Ping Up Ltd.</strong></p>
                                                            </td>
                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="column_cell px tc small tm">
                                <p style="font-size: 14px;line-height: 20px;color: #7E868C;margin:20px 0 5px 0px;text-align:center">© PingUp ` +
  year +
  `. All Rights Reserved.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
    </center>
</div>`;

module.exports = {
  subject,
  body,
};
