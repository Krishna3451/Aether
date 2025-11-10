// import { NextResponse } from 'next/server'
// // The client you created from the Server-Side Auth instructions
// import { createClient } from '@/lib'

// export async function GET(request: Request) {
//     try {
//         console.log('Callback route hit:', request.url);
//         const { searchParams, origin } = new URL(request.url)
//         const code = searchParams.get('code')
//         const error = searchParams.get('error')
//         const error_description = searchParams.get('error_description')

//         if (error || error_description) {
//             console.error('OAuth error:', { error, error_description });
//             return NextResponse.redirect(`${origin}/auth/auth-code-error`)
//         }

//         // if "next" is in param, use it as the redirect URL
//         let next = searchParams.get('next') ?? '/dashboard'
//         if (!next.startsWith('/')) {
//             next = '/dashboard'
//         }

//         if (code) {
//             console.log('Auth code received:', code);
//             const supabase = await createClient()
//             const { data, error } = await supabase.auth.exchangeCodeForSession(code)
//             console.log('Session exchange result:', error ? 'Error' : 'Success');

//             if (error) {
//                 console.error('Session exchange error:', error);
//                 return NextResponse.redirect(`${origin}/auth/auth-code-error`)
//             }

//             if (!data.session) {
//                 console.error('No session data received');
//                 return NextResponse.redirect(`${origin}/auth/auth-code-error`)
//             }

//             const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
//             const isLocalEnv = process.env.NODE_ENV === 'development'
//             const host = isLocalEnv ? origin : `https://${forwardedHost}`
//             const redirectUrl = `${host}${next}`
//             console.log('Redirecting to:', redirectUrl);
//             return NextResponse.redirect(redirectUrl)
//         }

//         console.log('No auth code found');
//         return NextResponse.redirect(`${origin}/auth/auth-code-error`)
//     } catch (error) {
//         console.error('Unexpected error in callback route:', error);
//         return NextResponse.redirect(`${origin}/auth/auth-code-error`)
//     }
// }
import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib'

export async function GET(request: Request) {
    console.log("Starting callback route", request)
    const { searchParams, origin } = new URL(request.url)
    console.log("Callback route received URL:", request.url, searchParams, origin)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    console.log("Callback route received next:", next, 'code:', code)

    if (code) {
        console.log("Callback route received code:", code)
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        console.log("Callback route exchangeCodeForSession result:", error ? 'Error' : 'Success')
        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                console.log("Callback route received X-Forwarded-Host:", forwardedHost)
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                console.log("Callback route did not receive X-Forwarded-Host")
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    console.log("Callback route did not receive code")

    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}