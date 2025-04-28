import type { Context } from "@netlify/functions";

function subscribe(email: string, ipAddress: string) {
  const url = new URL(`https://api.buttondown.com/v1/subscribers`);
  const options = {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
    },
    body: JSON.stringify({
      email_address: email,
      type: "regular",
      ip_address: ipAddress,
    }),
  };

  return fetch(url.toString(), options);
}

export default async (req: Request, context: Context) => {
  const ipAddress = context.ip;
  const formData = await req.formData();
  const email = formData.get("email") as string;

  if (!email) {
    return new Response("Email is required", {
      status: 301,
      headers: { Location: "/newsletter/oops?error=email-required" },
    });
  }

  const response = await subscribe(email, ipAddress);

  if (response.status >= 200 && response.status < 300) {
    return new Response("Email subscribed", {
      status: 301,
      headers: { Location: "/newsletter/success" },
    });
  } else {
    const data = await response.json();

    console.log(response.status);
    console.error(data);

    return new Response("Email not subscribed", {
      status: 301,
      headers: {
        Location: `/newsletter/oops?error=${data.code}&message=${data.detail}`,
      },
    });
  }
};
