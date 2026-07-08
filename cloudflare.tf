terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 3.0"
    }
  }
}

provider "cloudflare" {
  api_token  = var.cloudflare_admin_api_token
  account_id = var.cloudflare_account_id
}

resource "cloudflare_workers_kv_namespace" "stk_rate_limit" {
  title = "wifi-billing-stk-rate-limit"
}

resource "cloudflare_account_token" "example_account_token" {
  account_id = var.cloudflare_account_id
  name       = "wifi-billing-kv-token"

  policies = [{
    effect = "allow"
    permission_groups = [{
      id = "1ba6ab4cacdb454b913bbb93e1b8cb8c"
      }, {
      id = "959972745952452f8be2452be8cbb9f2"
      }, {
      id = "094547ab6e77498c8c4dfa87fadd5c51"
      }, {
      id = "2002629aaff0454085bf5a201ed70a72"
      }, {
      id = "3b94c49258ec4573b06d51d99b6416c0"
      }, {
      id = "e17beae8b8cb423a99b1730f21238bed"
      }, {
      id = "9ff81cbbe65c400b97d92c3c1033cab6"
      }, {
      id = "eafd71286d0e4fdca404a7b4d203c5c9"
      }, {
      id = "06f0526e6e464647bd61b63c54935235"
      }, {
      id = "a9dba34cf5814d4ab2007b4ada0045bd"
      }, {
      id = "c244ec076974430a88bda1cdd992d0d9"
      }, {
      id = "4755a26eedb94da69e1066d98aa820be"
      }, {
      id = "9110d9dd749e464fb9f3961a2064efc5"
      }, {
      id = "f0235726de25444a84f704b7c93afadf"
      }, {
      id = "74e1036f577a48528b78d2413b40538d"
      }, {
      id = "79b3ec0d10ce4148a8f8bdc0cc5f97f2"
      }, {
      id = "2eee71c9364c4cacaf469e8370f09056"
      }, {
      id = "43137f8d07884d3198dc0ee77ca6e79b"
      }, {
      id = "5af6a2f284144e95a89840408439adef"
      }, {
      id = "685f9605fd4e44ec937b6a0db658e629"
      }, {
      id = "b88a3aa889474524bccea5cf18f122bf"
      }, {
      id = "e0dc25a0fbdf4286b1ea100e3256b0e3"
      }, {
      id = "6d7f2f5f5b1d4a0e9081fdc98d432fd1"
      }, {
      id = "3e0b5820118e47f3922f7c989e673882"
      }, {
      id = "0fd9d56bc2da43ad8ea22d610dd8cab1"
      }, {
      id = "a4308c6855c84eb2873e01b6cc85cbb3"
      }, {
      id = "ed07f6c337da4195b4e72a1fb2c6bcae"
      }, {
      id = "87065285ab38463481e72815eefd18c3"
      }, {
      id = "4bd3fb513a23494aa1341a7e1eb6e080"
      }, {
      id = "c03055bc037c4ea9afb9a9f104b7b721"
      }, {
      id = "89bb8c37d46042e98b84560eaaa6379f"
      }, {
      id = "dadeaf3abdf14126a77a35e0c92fc36e"
      }, {
      id = "24fc124dc8254e0db468e60bf410c800"
      }, {
      id = "5ea6da42edb34811a78d1b007557c0ca"
      }, {
      id = "28f4b596e7d643029c524985477ae49a"
      }, {
      id = "cdeb15b336e640a2965df8c65052f1e0"
      }, {
      id = "f6a7a748dad644ba9792d3f1d0204cc2"
      }, {
      id = "c4df38be41c247b3b4b7702e76eadae0"
      }, {
      id = "86cdbc42964b47fcbe848cd250ef2464"
      }, {
      id = "3030687196b94b638145a3953da2b699"
      }, {
      id = "0ac90a90249747bca6b047d97f0803e9"
      }, {
      id = "c9915d86fbff46af9dd945c0a882294b"
      }, {
      id = "fb6778dc191143babbfaa57993f1d275"
      }, {
      id = "e6d2666161e84845a636613608cee8d5"
    }]
    resources = jsonencode({
      "com.cloudflare.api.account.${var.cloudflare_account_id}" = {
        "com.cloudflare.api.account.zone.*" = "*"
      }
    })
  }, {
    effect = "allow"
    permission_groups = [{
      id = "6c8a3737f07f46369c1ea1f22138daaf"
      }, {
      id = "384a77ea7c2e47d898715dc6a064f3f4"
      }, {
      id = "ad7a6f88896d498f98eb30592abfbbf4"
      }, {
      id = "1e13c5124ca64b72b1969a67e8829049"
      }, {
      id = "4e5fd8ac327b4a358e48c66fcbeb856d"
      }, {
      id = "2fc1072ee6b743828db668fcb3f9dee7"
      }, {
      id = "f2f1e4d555854b8593912806eb459691"
      }, {
      id = "5541aee5804a4850aa6d77351cc4a610"
      }, {
      id = "e7e40392e132414fb68890c3328bdc6a"
      }, {
      id = "29d3afbfd4054af9accdd1118815ed05"
      }, {
      id = "aed5acd922ae4fa68560cf0094e3e517"
      }, {
      id = "bfe0d8686a584fa680f4c53b5eb0de6d"
      }, {
      id = "e9e3e5ccdebf43dbb1c9576fe74dfaab"
      }, {
      id = "6d23f290472f4e6fad5c4398c057c356"
      }, {
      id = "bc783549a3a741aaa10556faf8b485bb"
      }, {
      id = "5286f5b44cba457fa75b22f94716b8dd"
      }, {
      id = "d30c9ad8b5224e7cb8d41bcb4757effc"
      }, {
      id = "a1c0fec57cf94af79479a6d827fa518c"
      }, {
      id = "d320e35958c845c89e69098a4ea38f64"
      }, {
      id = "d376dac8822b439a991b795c87789e6f"
      }, {
      id = "5e5d3e8efeec49f3afb67baf8bcd511"
      }, {
      id = "5bc3f8b21c554832afc660159ab75fa4"
      }, {
      id = "6d7d15b1d1404e22ac442de7061d02a6"
      }, {
      id = "ba9adcdbea5940dd84aa692e77e8eaf6"
      }, {
      id = "8a9d35a7c8504208ad5c3e8d58e6162d"
      }, {
      id = "dc44f27f48ab405392a5f69fe822bd01"
      }, {
      id = "a416acf9ef5a4af19fb11ed3b96b1fe6"
      }, {
      id = "2edbf20661fd4661b0fe10e9e12f485c"
      }, {
      id = "56907406c3d548ed902070ec4df0e328"
      }, {
      id = "cfa2e2893226455c9b945914969dff7c"
      }, {
      id = "1af1fa2adc104452b74a9a3364202f20"
      }, {
      id = "cde8c82463b6414ca06e46b9633f52a6"
      }, {
      id = "db37e5f1cb1a4e1aabaef8deaea43575"
      }, {
      id = "6ffe7f4299db4d4cb54f64e0eb12a456"
      }, {
      id = "5b1d209212064a84aae4fb68e3908333"
      }, {
      id = "e84fd345697c4036a14e7810da036e1a"
      }, {
      id = "f9e1ba803b8d4d52b4d4184825b07a28"
      }, {
      id = "7fb8d27511b34d02994d005b520b679f"
      }, {
      id = "6c80e02421494afc9ae14414ed442632"
      }, {
      id = "adddda876faa4a0590f1b23a038976e4"
      }, {
      id = "b9ed086b20864ad89c5aac24cdd02365"
      }, {
      id = "cb142f7fbc3540f0bade0cbe75f606dc"
      }, {
      id = "b711942448db4b0aace44d1312f9fdb0"
      }, {
      id = "c6f6338ceae545d0b90daaa1fed855e6"
      }, {
      id = "a3567c13e074447fb101babac3463566"
      }, {
      id = "26ce6c7d18a346528e7b905d5e269866"
      }, {
      id = "9bf884ba0de445dab37ea4a3e1a2c9f1"
      }, {
      id = "92c8dcd551cc42a6a57a54e8f8d3f3e3"
      }, {
      id = "5b5c774a5d174ca88d046c8889648b3f"
      }, {
      id = "037b9e348b3b42d4b46ea2fcb1cfb3e7"
      }, {
      id = "a7030c9c98d544e092d8b099fabb1f06"
      }, {
      id = "e2980d9241cf4939bbbd74fdc43b9651"
      }, {
      id = "c07321b023e944ff818fec44d8203567"
      }, {
      id = "677767156f294485b497a8f103172e7d"
      }, {
      id = "7c81856725af47ce89a790d5fb36f362"
    }]
    resources = jsonencode({
      "com.cloudflare.api.account.${var.cloudflare_account_id}" = "*"
    })
  }]
}

output "cloudflare_kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.stk_rate_limit.id
}

output "cloudflare_api_token" {
  value     = cloudflare_account_token.example_account_token.api_token
  sensitive = true
}
