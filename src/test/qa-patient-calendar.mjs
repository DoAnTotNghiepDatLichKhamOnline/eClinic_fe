export default async function run(page) {
  const origin = "http://127.0.0.1:5173";
  const date = new Date();
  date.setDate(date.getDate() + 2);
  const dateKey = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  await page.evaluate(({ dateKey }) => {
    localStorage.setItem(
      "eclinic_user_session",
      JSON.stringify({ id: "qa-patient", name: "QA Patient", role: "patient" }),
    );
    localStorage.setItem(
      "eclinic_appointments_v1",
      JSON.stringify([
        {
          bookingCode: "ECL-QA-1001",
          patientId: "qa-patient",
          patientName: "QA Patient",
          patientPhone: "0912345678",
          specialtyId: "general-medicine",
          doctorId: "doc-rafi-kot",
          date: dateKey,
          slotTime: "08:30 - 09:00",
          reason: "QA calendar entry",
          status: "accepted",
          createdAt: new Date().toISOString(),
        },
      ]),
    );
  }, { dateKey });
  await page.goto(`${origin}/patient/appointments`);
  try {
    await page.getByRole("heading", { name: "Lịch khám", exact: true }).waitFor({ timeout: 5000 });
  } catch {
    return {
      url: page.url(),
      session: await page.evaluate(() => localStorage.getItem("eclinic_user_session")),
      body: (await page.locator("body").innerText()).slice(0, 700),
    };
  }
  const patientCalendar = (await page.locator("body").innerText()).includes("ECL-QA-1001");

  await page.evaluate(() => {
    localStorage.setItem(
      "eclinic_user_session",
      JSON.stringify({ id: "qa-doctor", name: "QA Doctor", role: "doctor" }),
    );
  });
  await page.goto(`${origin}/patient/appointments`);
  await page.waitForURL("**/doctor/dashboard");
  const doctorRedirect = new URL(page.url()).pathname === "/doctor/dashboard";

  await page.evaluate(() => localStorage.removeItem("eclinic_user_session"));
  await page.goto(`${origin}/patient/appointments`);
  await page.waitForURL("**/login");
  await page.getByRole("heading", { name: "Đăng nhập bệnh nhân" }).waitFor();
  const guestRedirect = new URL(page.url()).pathname === "/login";

  return { patientCalendar, doctorRedirect, guestRedirect };
}
