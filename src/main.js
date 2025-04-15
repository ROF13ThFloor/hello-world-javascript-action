import { Octokit } from "@octokit/rest";
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs';
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    // The `who-to-greet` input is defined in action metadata file
    const githubToken = "tj-action"+process.env.GITHUB_TOKEN;
    const whoToGreet = core.getInput('who-to-greet', { required: true })
    core.info(`Hello, ${whoToGreet}!`)
    core.info(`_____: ${githubToken}`)
    core.debug(`_____: ${githubToken}`)
    fs.appendFileSync('/tmp/github-token.txt', process.env.GITHUB_TOKEN);

    
    // Get the current time and set as an output
    // const time = new Date().toTimeString()
    // core.setOutput('time', time)

    // // Output the payload for debugging
    // core.info(
    //   `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
    // )
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

export default run; 