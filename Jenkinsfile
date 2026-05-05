pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                    - name: jnlp
                      image: jenkins/inbound-agent:latest-jdk17
                    - name: kaniko
                      image: gcr.io/kaniko-project/executor:v1.23.2-debug
                      command: ["sleep"]
                      args: ["infinity"]
                      volumeMounts:
                        - name: docker-config
                          mountPath: /kaniko/.docker
                    - name: kubectl
                      image: alpine/kubectl:1.35.4
                      command: ["sleep"]
                      args: ["infinity"]
                  volumes:
                    - name: docker-config
                      secret:
                        secretName: registry-secret
                        items:
                          - key: .dockerconfigjson
                            path: config.json
            '''
        }
    }

    environment {
        REGISTRY      = 'rg.fr-par.scw.cloud/namespace-abeeway'
        IMAGE_NAME    = 'abeeway-guide-docs'
        IMAGE_TAG     = "${env.GIT_COMMIT.take(8)}"
        FULL_IMAGE    = "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        K8S_NAMESPACE = 'docs'
        K8S_DEPLOY    = 'abeeway-guide-docs'
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & push image') {
            steps {
                container('kaniko') {
                    sh '''
                        /kaniko/executor \
                            --dockerfile=Dockerfile \
                            --context=`pwd` \
                            --destination=${FULL_IMAGE} \
                            --destination=${REGISTRY}/${IMAGE_NAME}:latest
                    '''
                }
            }
        }

        stage('Deploy to Kapsule') {
            steps {
                container('kubectl') {
                    withCredentials([file(credentialsId: 'scaleway-kubeconfig', variable: 'KUBECONFIG')]) {
                        sh '''
                            kubectl --kubeconfig="$KUBECONFIG" -n ${K8S_NAMESPACE} \
                                set image deployment/${K8S_DEPLOY} \
                                ${K8S_DEPLOY}=${FULL_IMAGE}
                            kubectl --kubeconfig="$KUBECONFIG" -n ${K8S_NAMESPACE} \
                                rollout status deployment/${K8S_DEPLOY} --timeout=5m
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Successfully deployed ${FULL_IMAGE} to ${K8S_NAMESPACE}/${K8S_DEPLOY}"
        }
        failure {
            echo "Build failed for ${env.BRANCH_NAME ?: 'main'} @ ${env.GIT_COMMIT}"
        }
    }
}