import OpenAI from "openai";

// Check if OpenAI API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function generateBookingMessage(customerName: string, date: string, time: string): Promise<string> {
  if (!openai) {
    // Return a professional confirmation message if OpenAI is not configured
    return `Dear ${customerName}, your appointment is confirmed for ${date} at ${time}. We look forward to seeing you at our barbershop. Please arrive 5 minutes early and bring a valid ID. If you need to reschedule or cancel, please call us at least 24 hours in advance. Thank you for choosing our services!`;
  }

  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional barbershop assistant. Generate a warm, personalized booking confirmation message. Keep it friendly but professional, around 2-3 sentences. Include the appointment details and any helpful reminders."
        },
        {
          role: "user",
          content: `Generate a booking confirmation message for ${customerName} with an appointment on ${date} at ${time}.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0].message.content || "Your appointment has been confirmed. We look forward to seeing you!";
  } catch (error) {
    console.error("Error generating AI message:", error);
    // Fallback to a standard professional message
    return `Dear ${customerName}, your appointment is confirmed for ${date} at ${time}. We look forward to seeing you at our barbershop. Please arrive 5 minutes early. Thank you!`;
  }
}

export async function sendEmailConfirmation(email: string, message: string): Promise<boolean> {
  // Email functionality would require SendGrid setup
  // For now, we'll just log the email that would be sent
  console.log(`Email confirmation would be sent to ${email}:`);
  console.log(message);
  
  // Return true to indicate the operation completed (even if logged)
  return true;
}