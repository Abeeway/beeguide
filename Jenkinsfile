pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                    - name: kaniko
                      image: gcr.io/kaniko-project/executor:v1.23.2-debug
                      command: ["sleep"]
                      args: ["infinity"]
                      volumeMounts:
                        - name: docker-config
                          mountPath: /kaniko/.docker
                    - name: kubectl
                      image: bitnami/kubectl:1.30
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

        stage('Build image') {
            steps {
                sh 'docker build -t ${FULL_IMAGE} -t ${REGISTRY}/${IMAGE_NAME}:latest .'
            }
        }

        stage('Push to Scaleway Registry') {
            steps {
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

        stage('Deploy to Kapsule') {
            steps {
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

    post {
        always  { sh 'docker image prune -f || true' }
        failure { echo "Build failed for ${env.BRANCH_NAME} @ ${env.GIT_COMMIT}" }
    }
}