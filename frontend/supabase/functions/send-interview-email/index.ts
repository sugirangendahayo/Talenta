// supabase/functions/send-interview-email/index.ts
/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";


// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email template generator
function generateInterviewEmail(data: {
  jobseekerName: string;
  jobTitle: string;
  companyName: string;
  interviewType: string;
  interviewDate: string;
  interviewTime: string;
  location?: string;
  meetingLink?: string;
  additionalNotes?: string;
}): string {
  const {
    jobseekerName,
    jobTitle,
    companyName,
    interviewType,
    interviewDate,
    interviewTime,
    location,
    meetingLink,
    additionalNotes,
  } = data;

  const formattedDate = new Date(interviewDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const interviewDetails =
    interviewType === "physical"
      ? `<p><strong>📍 Location:</strong> ${location}</p>`
      : `<p><strong>💻 Meeting Link:</strong> <a href="${meetingLink}" style="color: #0E7490; text-decoration: none;">${meetingLink}</a></p>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #0E7490 0%, #06b6d4 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .header p {
          margin: 0;
          font-size: 18px;
          opacity: 0.95;
        }
        .content { 
          padding: 40px 30px;
          background: #ffffff;
        }
        .content p {
          margin: 0 0 16px 0;
        }
        .details-box { 
          background: #f9fafb;
          padding: 24px; 
          border-left: 4px solid #0E7490; 
          margin: 24px 0;
          border-radius: 8px;
        }
        .details-box h3 {
          margin: 0 0 16px 0;
          color: #0E7490;
          font-size: 20px;
        }
        .details-box p {
          margin: 8px 0;
          font-size: 15px;
        }
        .warning { 
          background: #fef3c7;
          border-left: 4px solid #f59e0b; 
          padding: 20px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .warning strong {
          color: #92400e;
        }
        .tips {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
        }
        .tips ul {
          margin: 12px 0 0 0;
          padding-left: 20px;
        }
        .tips li {
          margin: 8px 0;
          color: #1e40af;
        }
        .footer { 
          text-align: center; 
          color: #6b7280; 
          font-size: 13px; 
          padding: 30px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 8px 0;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .header, .content {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>You've Been Shortlisted</p>
        </div>
        
        <div class="content">
          <p>Dear <strong>${jobseekerName}</strong>,</p>
          
          <p>Great news! Your application for <strong>${jobTitle}</strong> at 
          <strong>${companyName}</strong> has been shortlisted.</p>
          
          <div class="details-box">
            <h3>📅 Interview Details</h3>
            <p><strong>Position:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Interview Type:</strong> ${
              interviewType === "physical" ? "Physical Interview" : "Online Interview"
            }</p>
            <p><strong>📆 Date:</strong> ${formattedDate}</p>
            <p><strong>🕐 Time:</strong> ${interviewTime}</p>
            ${interviewDetails}
            ${
              additionalNotes
                ? `<p style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;"><strong>📝 Additional Notes:</strong><br>${additionalNotes}</p>`
                : ""
            }
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> Interview arrangements are managed directly by the employer. 
            For any changes, cancellations, or questions about the interview, please contact the employer directly.
          </div>
          
          <div class="tips">
            <p><strong>💡 Tips for Interview Success:</strong></p>
            <ul>
              <li>Review your application and the job description thoroughly</li>
              <li>Prepare thoughtful questions about the role and company</li>
              <li>${
                interviewType === "online"
                  ? "Test your internet connection, camera, and microphone beforehand"
                  : "Plan your route and aim to arrive 10-15 minutes early"
              }</li>
              <li>Dress professionally and maintain a positive attitude</li>
              <li>Bring copies of your resume and any relevant documents</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px;">We wish you the best of luck with your interview!</p>
          
          <p style="margin-top: 24px;">
            Best regards,<br>
            <strong>Job Finder Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Job Finder App</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>For support, contact us through the app.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Main Edge Function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }), 
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { applicationId, interviewDetails } = await req.json();

    // Validate required fields
    if (!applicationId || !interviewDetails) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          required: ["applicationId", "interviewDetails"]
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate interview details
    const { 
      interviewType, 
      interviewDate, 
      interviewTime, 
      location, 
      meetingLink 
    } = interviewDetails;

    if (!interviewType || !interviewDate || !interviewTime) {
      return new Response(
        JSON.stringify({ 
          error: "Missing interview details",
          required: ["interviewType", "interviewDate", "interviewTime"]
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (interviewType === 'physical' && !location) {
      return new Response(
        JSON.stringify({ error: "Location is required for physical interviews" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (interviewType === 'online' && !meetingLink) {
      return new Response(
        JSON.stringify({ error: "Meeting link is required for online interviews" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch application with jobseeker and job details
    const { data: application, error: appError } = await supabase
      .from("job_applications")
      .select(`
        jobseeker_id,
        job_id,
        jobseeker_profiles!inner(
          first_name,
          last_name,
          email
        ),
        jobs!inner(
          title,
          employer_profiles!inner(company_name)
        )
      `)
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      console.error("Application fetch error:", appError);
      return new Response(
        JSON.stringify({ 
          error: "Application not found",
          details: appError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Prepare email data
    const emailData = {
      jobseekerName: `${application.jobseeker_profiles.first_name} ${application.jobseeker_profiles.last_name}`,
      jobTitle: application.jobs.title,
      companyName: application.jobs.employer_profiles.company_name,
      interviewType: interviewDetails.interviewType,
      interviewDate: interviewDetails.interviewDate,
      interviewTime: interviewDetails.interviewTime,
      location: interviewDetails.location,
      meetingLink: interviewDetails.meetingLink,
      additionalNotes: interviewDetails.additionalNotes,
    };

    // Get Resend API key
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured. Set it with: supabase secrets set RESEND_API_KEY=your_key");
    }

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Job Finder <onboarding@resend.dev>", // Change this to your verified domain
        to: application.jobseeker_profiles.email,
        subject: `Interview Invitation: ${application.jobs.title} at ${application.jobs.employer_profiles.company_name}`,
        html: generateInterviewEmail(emailData),
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Email sending failed: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    // Update interview record to mark email as sent
    const { error: updateError } = await supabase
      .from("interviews")
      .update({ email_sent: true })
      .eq("application_id", applicationId);

    if (updateError) {
      console.error("Failed to update interview record:", updateError);
      // Don't throw - email was sent successfully
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Interview email sent successfully",
        emailId: emailResult.id,
        sentTo: application.jobseeker_profiles.email,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Edge Function error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});