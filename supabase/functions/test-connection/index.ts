// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

async function testSFTPConnection(host: string, port: number) {
  try {
    const conn = await Deno.connect({ hostname: host, port: port });
    conn.close();
    return 'SFTP connection successful (TCP connection established)';
  } catch (error) {
    throw new Error(`SFTP connection failed: ${error.message}`);
  }
}

async function testSalesforceConnection(authUrl: string, consumerKey: string, consumerSecret: string) {
  try {
    const tokenUrl = `${authUrl}/services/oauth2/token`;
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: consumerKey,
        client_secret: consumerSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return 'Salesforce connection successful';
  } catch (error) {
    throw new Error(`Salesforce connection failed: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      connection_type, 
      sftp_host, 
      sftp_port, 
      sftp_username, 
      sftp_password,
      salesforce_authentication_URL,
      salesforce_consumer_key,
      salesforce_consumer_secret,
      id 
    } = await req.json()
    let status = 'Failed'
    let message = ''

    if (connection_type === 'SFTP' && sftp_host && sftp_port) {
      try {
        message = await testSFTPConnection(sftp_host, sftp_port)
        status = 'Connected'
      } catch (err) {
        message = err.message
      }
    } else if (connection_type === 'Salesforce' && salesforce_authentication_URL && salesforce_consumer_key && salesforce_consumer_secret) {
      try {
        message = await testSalesforceConnection(salesforce_authentication_URL, salesforce_consumer_key, salesforce_consumer_secret)
        status = 'Connected'
      } catch (err) {
        message = err.message
      }
    } else {
      message = 'Invalid connection type or missing parameters'
    }

    if (id && status === 'Connected') {
      try {
        const { error: updateError } = await supabaseAdmin
          .from('connections')
          .update({ last_connected: new Date().toISOString(), status: status })
          .eq('id', id)

        if (updateError) {
          console.error('Failed to update connection:', updateError)
        }
      } catch (updateError) {
        console.error('Failed to update connection:', updateError)
      }
    } else {
      console.log('No id provided or connection failed, skipping update in database')
    }

    return new Response(
      JSON.stringify({ status, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        details: 'An unexpected error occurred in the Edge Function'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})