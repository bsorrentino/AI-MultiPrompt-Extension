import 'zx/globals'

const { 
    installed : { client_id, client_secret},
    refresh_token,
    extension_id
} = require( "./apps.googleusercontent.com.json" )

const zip = path.join('dist', 'chrome-extension.zip')

await fs.ensureDir( path.dirname( zip ) )
within(async () => {
    cd( 'Chrome')
    await $`zip -r ${path.join( '..', zip) } .`
})

const args = [
    client_id,
    client_secret,
    refresh_token,
    zip,
    extension_id
]
console.log( args)

await $`npx cws-upload ${args}`