'use strict';

/**
 * Detailed mock log lines for each build phase.
 * Each entry: { kind: 'info'|'success'|'warn'|'error', text: string, delayMs: number }
 *
 * delayMs = time AFTER this line before the next line is emitted.
 * The BUILD_SPEED_MULTIPLIER env var scales all delays.
 */

const M = () => parseFloat(process.env.BUILD_SPEED_MULTIPLIER || '1');

const steps = {

  preparing: (build) => [
    { kind:'info',    text:`🔧 Mac Build Cloud — Build Engine v2.4.1`,               delayMs:200  },
    { kind:'info',    text:`🖥  Node: mac-01 | macOS 14.3 | Xcode ${build.xcode_version}`, delayMs:300 },
    { kind:'info',    text:`📋 Build ID: ${build.id}`,                                delayMs:200  },
    { kind:'info',    text:`📦 Project:  ${build.project}`,                           delayMs:150  },
    { kind:'info',    text:`🌿 Branch:   ${build.branch}`,                            delayMs:150  },
    { kind:'info',    text:`🌍 Region:   ${build.region}`,                            delayMs:150  },
    { kind:'info',    text:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,               delayMs:400  },
    { kind:'info',    text:`[1/6] Preparing build environment…`,                       delayMs:600  },
    { kind:'info',    text:`  → Allocating ephemeral workspace at /tmp/build/${build.id.slice(-8)}`, delayMs:400 },
    { kind:'info',    text:`  → Setting DEVELOPER_DIR=/Applications/Xcode.app`,       delayMs:300  },
    { kind:'info',    text:`  → Validating Xcode ${build.xcode_version} toolchain…`,  delayMs:500  },
    { kind:'success', text:`  ✅ Environment ready`,                                   delayMs:300  },
  ],

  cloning: (build) => [
    { kind:'info',    text:`[2/6] Cloning repository…`,                               delayMs:400  },
    { kind:'info',    text:`  → git clone --depth 1 --branch ${build.branch} ${build.repo_url}`, delayMs:800 },
    { kind:'info',    text:`  Cloning into '${build.project}'...`,                    delayMs:600  },
    { kind:'info',    text:`  remote: Enumerating objects: 1,842, done.`,             delayMs:400  },
    { kind:'info',    text:`  remote: Counting objects: 100% (1842/1842), done.`,     delayMs:300  },
    { kind:'info',    text:`  remote: Compressing objects: 100% (741/741), done.`,    delayMs:400  },
    { kind:'info',    text:`  Receiving objects: 100% (1842/1842), 12.4 MiB | 18.2 MiB/s`, delayMs:500 },
    { kind:'info',    text:`  Resolving deltas: 100% (1102/1102), done.`,             delayMs:300  },
    { kind:'success', text:`  ✅ Repository cloned — HEAD: ${build.branch}@${randomHash()}`, delayMs:300 },
  ],

  dependencies: (build) => [
    { kind:'info',    text:`[3/6] Installing dependencies…`,                           delayMs:400  },
    { kind:'info',    text:`  → Checking Gemfile.lock…`,                              delayMs:300  },
    { kind:'info',    text:`  → bundle install --without development test`,            delayMs:400  },
    { kind:'info',    text:`  Fetching gem metadata from https://rubygems.org/…`,     delayMs:600  },
    { kind:'info',    text:`  Using fastlane 2.218.0`,                                delayMs:200  },
    { kind:'info',    text:`  → pod install --repo-update`,                           delayMs:800  },
    { kind:'info',    text:`  Analyzing dependencies`,                                 delayMs:500  },
    { kind:'info',    text:`  Downloading dependencies`,                               delayMs:700  },
    { kind:'info',    text:`  Installing Alamofire (5.8.1)`,                          delayMs:300  },
    { kind:'info',    text:`  Installing Firebase (10.18.0)`,                         delayMs:400  },
    { kind:'info',    text:`  Installing Kingfisher (7.10.1)`,                        delayMs:300  },
    { kind:'info',    text:`  Installing SnapKit (5.7.1)`,                            delayMs:300  },
    { kind:'info',    text:`  Installing RxSwift (6.6.0)`,                            delayMs:300  },
    { kind:'info',    text:`  Pod installation complete! 47 pods installed.`,         delayMs:400  },
    { kind:'success', text:`  ✅ All dependencies installed`,                          delayMs:300  },
  ],

  compiling: (build) => [
    { kind:'info',    text:`[4/6] Running xcodebuild…`,                               delayMs:400  },
    { kind:'info',    text:`  → xcodebuild archive \\`,                               delayMs:200  },
    { kind:'info',    text:`      -scheme ${build.project} \\`,                       delayMs:200  },
    { kind:'info',    text:`      -configuration Release \\`,                         delayMs:200  },
    { kind:'info',    text:`      -archivePath /tmp/build/${build.id.slice(-8)}/${build.project}.xcarchive`, delayMs:400 },
    { kind:'info',    text:`  Build settings from command line:`,                      delayMs:300  },
    { kind:'info',    text:`    ARCHS = arm64`,                                       delayMs:200  },
    { kind:'info',    text:`    CODE_SIGN_STYLE = Manual`,                            delayMs:200  },
    { kind:'info',    text:`  Compiling Swift sources… [░░░░░░░░░░░░░░░░]   0%`,      delayMs:800  },
    { kind:'info',    text:`  Compiling Swift sources… [████░░░░░░░░░░░░]  25%`,      delayMs:900  },
    { kind:'info',    text:`  Compiling Swift sources… [████████░░░░░░░░]  50%`,      delayMs:900  },
    { kind:'warn',    text:`  ⚠️  warning: URLSession.dataTask deprecated (NetworkManager.swift:42)`, delayMs:300 },
    { kind:'info',    text:`  Compiling Swift sources… [████████████░░░░]  75%`,      delayMs:900  },
    { kind:'info',    text:`  Compiling Swift sources… [████████████████] 100%`,      delayMs:600  },
    { kind:'info',    text:`  Linking ${build.project}`,                              delayMs:400  },
    { kind:'info',    text:`  Signing ${build.project} with distribution certificate`, delayMs:500 },
    { kind:'success', text:`  ✅ Archive created: ${build.project}.xcarchive`,        delayMs:300  },
  ],

  packaging: (build) => [
    { kind:'info',    text:`[5/6] Packaging IPA…`,                                    delayMs:400  },
    { kind:'info',    text:`  → xcodebuild -exportArchive \\`,                        delayMs:200  },
    { kind:'info',    text:`      -archivePath ${build.project}.xcarchive \\`,        delayMs:200  },
    { kind:'info',    text:`      -exportPath /tmp/build/${build.id.slice(-8)}/export \\`, delayMs:200 },
    { kind:'info',    text:`      -exportOptionsPlist ExportOptions.plist`,           delayMs:400  },
    { kind:'info',    text:`  2026-03-08 14:22:30.112  xcodebuild[1024:12345]`,       delayMs:300  },
    { kind:'info',    text:`  Exporting ${build.project} from archive`,               delayMs:400  },
    { kind:'info',    text:`  Copying Swift standard libraries…`,                     delayMs:500  },
    { kind:'info',    text:`  Packaging application: ${build.project}.ipa`,           delayMs:600  },
    { kind:'success', text:`  ✅ ${build.project}_${randomVersion()}_release.ipa — ${randomSize()}`, delayMs:400 },
  ],

  success: (build) => [
    { kind:'info',    text:`[6/6] Finalising…`,                                       delayMs:300  },
    { kind:'info',    text:`  → Uploading artifact to storage…`,                      delayMs:500  },
    { kind:'info',    text:`  → Notifying webhooks…`,                                 delayMs:300  },
    { kind:'success', text:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,               delayMs:200  },
    { kind:'success', text:`🎉 BUILD SUCCESSFUL`,                                      delayMs:100  },
    { kind:'success', text:`   Total time: ${build._elapsed || '4m 32s'}`,            delayMs:100  },
    { kind:'success', text:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,               delayMs:0    },
  ],

  failed_cs: (build) => [
    { kind:'info',    text:`[4/6] Running xcodebuild…`,                               delayMs:400  },
    { kind:'info',    text:`  → Validating code signing identity…`,                   delayMs:600  },
    { kind:'error',   text:`  error: Provisioning profile validation failed`,         delayMs:300  },
    { kind:'error',   text:`  error: ITMS-90168: Profile '${build.project.toLowerCase()}.app' expired`, delayMs:300 },
    { kind:'error',   text:`  error: Code signing failed — upload a valid provisioning profile`, delayMs:300 },
    { kind:'error',   text:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,               delayMs:200  },
    { kind:'error',   text:`💥 BUILD FAILED [CS-001]`,                                delayMs:0    },
  ],

  failed_xc: (build) => [
    { kind:'info',    text:`[4/6] Running xcodebuild…`,                               delayMs:400  },
    { kind:'info',    text:`  Compiling Swift sources… [████░░░░░░░░░░░░]  25%`,      delayMs:600  },
    { kind:'error',   text:`  ${build.project}/NetworkManager.swift:12:8: error: no such module 'Alamofire'`, delayMs:300 },
    { kind:'error',   text:`  import Alamofire`,                                      delayMs:200  },
    { kind:'error',   text:`         ^`,                                              delayMs:200  },
    { kind:'error',   text:`  Build failed with 1 error`,                             delayMs:300  },
    { kind:'error',   text:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,               delayMs:200  },
    { kind:'error',   text:`💥 BUILD FAILED [XC-065]`,                                delayMs:0    },
  ],
};

function randomHash() {
  return Math.random().toString(16).slice(2, 9);
}
function randomVersion() {
  return `${Math.floor(Math.random()*3)+1}.${Math.floor(Math.random()*9)+1}.${Math.floor(Math.random()*9)}`;
}
function randomSize() {
  return `${(Math.random()*30+20).toFixed(1)} MB`;
}

module.exports = { steps, randomSize, randomVersion };
