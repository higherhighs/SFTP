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

async function getSalesforceToken(authUrl, clientId, clientSecret) {
  const tokenUrl = `${authUrl}/services/oauth2/token`;
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain token: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    instance_url: data.instance_url
  };
}

async function testSalesforceConnection(instanceUrl, accessToken) {
  const testResponse = await fetch(`${instanceUrl}/services/data/v54.0/sobjects`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!testResponse.ok) {
    const errorData = await testResponse.json();
    throw new Error(errorData[0]?.message || 'Failed to connect to Salesforce API');
  }

  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      id,
      connection_type, 
      sftp_host, 
      sftp_port, 
      sftp_username, 
      sftp_password,
      salesforce_authentication_URL,
      salesforce_consumer_key,
      salesforce_consumer_secret,
    } = await req.json()

    let status = 'Error'
    let message = ''

    if (connection_type === 'SFTP') {
      // Existing SFTP connection test code...
    } else if (connection_type === 'Salesforce') {
      try {
        // Always get a new token
        const tokenData = await getSalesforceToken(
          salesforce_authentication_URL,
          salesforce_consumer_key,
          salesforce_consumer_secret
        );

        // Test the connection
        await testSalesforceConnection(tokenData.instance_url, tokenData.access_token);

        // Update the connection with the new token only if id is provided
        if (id) {
          const { error: updateError } = await supabaseAdmin
            .from('connections')
            .update({ 
              salesforce_access_token: tokenData.access_token
            })
            .eq('id', id);

          if (updateError) {
            console.error('Failed to update token:', updateError);
            // Don't throw an error here, just log it
          }
        } else {
          console.log('No id provided, skipping token update in database');
        }

        status = 'Connected'
        message = 'Salesforce connection successful'
      } catch (err) {
        message = `Salesforce connection failed: ${err.message}`
      }
    }

    return new Response(
      JSON.stringify({ status, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Edge Function error:', error);
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