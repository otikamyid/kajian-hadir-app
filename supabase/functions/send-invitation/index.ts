
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, name, phone, token, invitedBy } = await req.json()

    // Create invitation link
    const invitationUrl = `${Deno.env.get('SUPABASE_URL')?.replace('//', '//')}/auth/v1/verify?token=${token}&type=invite&redirect_to=${encodeURIComponent('https://preview--kajian-hadir-app.lovable.app/auth')}`

    // Send email via Supabase Auth
    const { error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `https://preview--kajian-hadir-app.lovable.app/auth?invitation_token=${token}`,
      data: {
        name: name,
        phone: phone,
        invitation_token: token
      }
    })

    if (inviteError) {
      console.error('Invite error:', inviteError)
      throw inviteError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
