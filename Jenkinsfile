pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  serviceAccountName: jenkins
                  containers:
                    - name: jnlp
                      image: jenkins/inbound-agent:latest-jdk17
                    - name: docker
                      image: docker:27-cli
                      command: ["sleep"]
                      args: ["infinity"]
                      env:
                        - name: DOCKER_HOST
                          value: tcp://localhost:2375
                    - name: dind
                      image: docker:27-dind
                      securityContext:
                        privileged: true
                      env:
                        - name: DOCKER_TLS_CERTDIR
                          value: ""
                        args:
                          - --host=tcp://0.0.0.0:2375
                          - --host=unix:///var/run/docker.sock
                    - name: kubectl
                      image: alpine/kubectl:1.35.4
                      command: ["sleep"]
                      args: ["infinity"]
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

        stage('Build image') {
            steps {
                container('docker') {
                    sh 'docker build -t ${FULL_IMAGE} -t ${REGISTRY}/${IMAGE_NAME}:latest .'
                }
            }
        }

        stage('Push to Scaleway Registry') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(
                        credentialsId: 'scaleway-registry',
                        usernameVariable: 'REG_USER',
                        passwordVariable: 'REG_PASS'
                    )]) {
                        sh '''
                            echo "$REG_PASS" | docker login rg.fr-par.scw.cloud -u "$REG_USER" --password-stdin
                            docker push ${FULL_IMAGE}
                            docker push ${REGISTRY}/${IMAGE_NAME}:latest
                            docker logout rg.fr-par.scw.cloud
                        '''
                    }
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
                                ${K8S_DEPLOY}=${FULL_IMAGE} --record
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
            echo "Build failed for ${env.BRANCH_NAME ?: 'unknown branch'} @ ${env.GIT_COMMIT}"
        }
    }
}